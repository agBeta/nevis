import path from "node:path";
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as http from "node:http";
import { promisify } from "node:util";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "..", "configs", "user-signup.env"),
    override: true
});
//  When you import authRouter normally (i.e. not using await import(..) ), inside auth-router.js implementation
//  it will import some modules from src/data-access. In data-access/index.js the code will try to create a dbConnectionPool
//  but at that moment env variables aren't loaded yet, due to hoisting of import.
//  In order to overcome this problem we make imports imperative using the import function.
//  See hoisting imports in node.md in self-documentation.

const makeDbConnectionPool = (await import("../../src/data-access/connection.js")).default;
const { installRouter, makeExpressApp } = await import("../../src/express-stuff/server.js");
const authRouter = (await import("../../src/routes/auth-router.js")).router;
const DbFx = await import("../fixtures/db.js");
const { makeFakeUser } = await import("../fixtures/user.js");
const makeHttpClient = (await import("../fixtures/http-client.js")).default;
const doListen = (await import("../fixtures/listen.js")).default;


const PORT = Number(process.env.SERVER_PORT);
const agent = makeHttpClient({ port: PORT });





describe("user signup", { concurrency: false, timeout: 8000 }, () => {
    let /** @type {MySQLConnectionPool} */ db;
    let /** @type {WebAppServer} */ server;

    before(async () => {
        db = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) });
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
