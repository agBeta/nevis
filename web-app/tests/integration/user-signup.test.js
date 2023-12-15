import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as http from "node:http";
import { promisify } from "node:util";
import makeDbConnectionPool from "../../src/data-access/connection.js";
import { installRouter, makeExpressApp } from "../../src/express-stuff/server.js";
import { router as authRouter } from "../../src/routes/auth-router.js";
import * as DbFx from "../fixtures/db.js";
import TEST_CONFIG from "../fixtures/configuration.js";
import { makeFakeUser } from "../fixtures/user.js";
import makeHttpClient from "../fixtures/http-client.js";
import doListen from "../fixtures/listen.js";

const PORT = TEST_CONFIG.uniqueTestPortFor["user-signup.test.js"];
const agent = makeHttpClient({ port: PORT });


describe("user signup", { concurrency: false, timeout: 8000 }, () => {
    let /** @type {MySQLConnectionPool} */ db;
    let /** @type {WebAppServer} */ server;

    before(async () => {
        db = makeDbConnectionPool();
        await DbFx.doClear(db, "codes");
        await DbFx.doClear(db, "users");

        const app = makeExpressApp();
        installRouter({ app, router: authRouter, pathPrefix: "/api/v1" });
        server = http.createServer(app);
        await doListen(server, PORT);
    });

    describe("@sanity", () => {
        assert.strictEqual(1, 1);
        assert.notStrictEqual(1, 2);
    });

    describe("happy flow", async () => {
        it("creates a signup code and stores in db", async () => {
            const user = makeFakeUser({});

            const raw = await agent.postRequest("/api/v1/auth/code", { email: user.email, purpose: "signup" });
            assert.strictEqual(raw.status, 201);

            const correspondingRecords = await DbFx.doFindAllInCodesDb(db, user.email);
            assert.strictEqual(correspondingRecords.length == 1, true);

            const exp = correspondingRecords[0].expiresAt;
            assert.strictEqual(exp instanceof Date, true);
            assert.strictEqual(exp.getTime() > Date.now() + 5 * 60 * 1000, true);

            assert.strictEqual(correspondingRecords[0].purpose, "signup");
        });

        // it("create a signup code and sends it via email", async (t) => {
        //     const spyEmail = t.mock.method(emailService, "send", function spiedImp(){
        //         console.log("hi".repeat(50));
        //     }, { times: Infinity });
        //     const user = makeFakeUser({});

        //     const raw = await postRequest("/api/auth/code", { email: user.email, purpose: "signup" });
        //     assert.strictEqual(raw.status, 201);
        //     assert.strictEqual(spyEmail.mock.callCount(), 1);
        // });

        // describe.todo("GIVEN supplied verification code and user profile details are valid", () => {
        //     it.todo("creates the user in db", async () => {

        //     });
        //     it.todo("sets session cookie");
        //     it.todo("returns user id");
        // });
    });

    // it.todo("returns 400 and does not create code if no email is supplied");
    // it.todo("returns 409 if given email already exists");

    after(async () => {
        await DbFx.doCloseConnections(db);
        await promisify(server.close.bind(server))();
    });
});


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").WebAppServer} WebAppServer
 */
