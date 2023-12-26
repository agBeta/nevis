// @ts-nocheck
//  We spin up an express app. Send request and feed it into adaptRequest. Then check the result should be expected.
//  This is the best way to test real behavior of adaptRequest.

import { test } from "node:test";
import assert from "node:assert";
import express from "express";
import http from "node:http";
import { promisify } from "node:util";
import adaptRequest from "./adapt-request.js";



test("adapt request", { concurrency: false, timeout: 6000 }, async (t) => {
    const PORT = 8880;
    let server;
    let adapted;

    await t.before(async function setupServer(){
        const app = express();
        // Must use express.json middleware. Otherwise you have to populate [req.body] manually (See https://nodejs.org/en/guides/anatomy-of-an-http-transaction).
        app.all("/test/:testId", express.json(), (req, res) => {
            // Mutating adapted. Make sure tests aren't executed concurrently.
            adapted = adaptRequest(req);
            res.status(200).json({ success: true });
        });
        server = http.createServer(app);
        await new Promise((resolve, reject) => {
            server.listen(PORT, (err) => {
                if (err) { return reject(err); }
                return resolve();
            });
        });
    });

    // await below is crucial.
    await t.test("01- should correctly adapt request", async () => {
        const headers = new Headers();
        headers.append("Content-Type", "application/json");

        const timestamp = new Date("2019-08-02T11:30:00+05:30").getTime();
        const payload = {
            key1: 10,
            key2: "Hello",
            key3: false,
            key4: new Date(timestamp),
            key5: "📢",
            key6: {
                key61: new Date(timestamp + 5000),
                key62: 20,
                key63: {
                    key631: 25,
                    key632: true,
                },
            }
        };

        await fetch(`http://localhost:${PORT}/test/10`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(payload),
        });

        assert.strictEqual(adapted.path, "/test/10");
        assert.strictEqual(adapted.method, "POST");
        assert.deepStrictEqual(adapted.pathParams, { testId: "10" });
        assert.strictEqual(adapted.headers["Content-Type"], "application/json");

        assert.strictEqual(adapted.body.key1, 10);
        assert.strictEqual(typeof adapted.body.key3 === "boolean", true);
        assert.strictEqual(adapted.body.key3, false);
        assert.strictEqual(adapted.body.key5, "📢");

        // Surprising. isn't it?
        assert.strictEqual(typeof adapted.body.key4 === "string", true);
        assert.notStrictEqual(adapted.body.key4 /*string*/, payload.key4 /*date object*/);

        assert.strictEqual(new Date(adapted.body.key4).getTime(), timestamp);


        assert.strictEqual(new Date(adapted.body.key6.key61).getTime(), timestamp + 5000);
        assert.strictEqual(adapted.body.key6.key62, payload.key6.key62);
        assert.strictEqual(adapted.body.key6.key63.key631, payload.key6.key63.key631);
        assert.strictEqual(adapted.body.key6.key63.key632, payload.key6.key63.key632);
    });


    await t.after(async () => {
        await promisify(server.close.bind(server))();
    });
});
