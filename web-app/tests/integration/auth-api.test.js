import test, { describe, before, after } from "node:test";
import assert from "node:assert";

let /** @type {WebAppServer} */ server;

describe("Authentication API", { concurrency: false, timeout: 8000 }, async () => {
    const PORT = 9009;

    /**
     * @param {string} url
     * @param {Object} body
     * @returns
     */
    function postRequest(url, body) {
        return fetch(`http://localhost:${PORT}/api` + url, {
            method: "POST",
            body: JSON.stringify(body)
        });
    }

    before(async () => {
        server = (await import("../../src/server.js")).server;
        server.listen(PORT);
    }, { signal: undefined, timeout: 8000 });


    await test("User Registration Workflow", { concurrency: false }, async (ctx) => {

        await ctx.test("should return 201 and send verification code to the specified email", async () => {
            const rawResponse = await postRequest("/auth/verification-code", { email: "hello@example.com" });
            assert.strictEqual(rawResponse.status, 400);
            const /** @type {any} */ resp = await rawResponse.json();
            assert.strictEqual("error" in resp, true);
            assert.strictEqual(resp.error, "test");
        });
        // t.todo("should verify newly registered email and add email to db",  async () => { });

        // it("should store username and password and other information for a verified email and also authenticate the user",
        //     { todo: true }, async () => { }
        // );

        // it("should return error when username or password is invalid, though email is verified",
        //     { todo: true }, async () => { }
        // );
        // it("should return error when client tries to register username and password but email is NOT verified",
        //     { todo: true }, async () => { }
        // );

        // it("should store user with displayName emoji inside database 🍩 \u{1F369}");
    });

    after(() => {
        server.close();
        server.closeAllConnections();
    });
});


// describe("User Login", { concurrency: false, timeout: 8000 }, () => {
//     it("should authenticate client with correct credentials and set session cookie", { todo: true }, async () => { });
//     it("should return error when the client tries to login with incorrect credentials",{ todo: true }, async () => { });
// });


/**
 * @typedef {import("#types").WebAppServer} WebAppServer
 */
