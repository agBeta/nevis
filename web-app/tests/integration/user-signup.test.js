import path from "node:path";
import { describe, it, before, after, mock } from "node:test";
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

//  There's a long enlightening story behind mocking send email. See test.md from self-documentation.
//  Now it's ok to mock it even after importing authRouter or controllers (as we are doing right now,
//  since the whole controllers execution context (?) is being created by doing import below). So it
//  seems ok to swap the order of two following import functions.
//  BTW, it's bad practice to export emailService from controller just because of tests. But at the
//  moment, it seems the cleanest approach. Anyway...
const emailService = (await import("#controllers")).emailService;
const authRouter = (await import("../../src/routes/auth-router.js")).router;

/** @type {Array<{email:string, body:string}>} */
const emailsSentDuringTest = [];
const spiedSendEmail = mock.method(emailService, "sendEmail", // @ts-ignore
    function mockedImplementation({ email, body /*ignore subject*/ }) {
        console.log(`📩 As if we are sending email to ${email}.`);
        emailsSentDuringTest.push({ email, body });
    },
    { times: Infinity },
);

// Fixtures and utils for test
const DbFx = await import("../fixtures/db.js");
const { makeFakeUser } = await import("../fixtures/user.js");
const makeHttpClient = (await import("../fixtures/http-client.js")).default;
const doListen = (await import("../fixtures/listen.js")).default;


const PORT = Number(process.env.PORT);
const agent = makeHttpClient({ port: PORT });




describe("user signup", { concurrency: false, timeout: 8000 }, () => {
    let /** @type {MySQLConnectionPool} */ db;
    let /** @type {WebAppServer} */ server;

    before(async () => {
        // console.log("🚀 ".repeat(20));
        db = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) });
        await DbFx.doClear(db, "code");
        await DbFx.doClear(db, "user");

        const app = makeExpressApp();
        installRouter({ app, router: authRouter, pathPrefix: "/api/v1/auth" });
        server = http.createServer(app);
        await doListen(server, PORT);
        // console.log("📢 ".repeat(20));
    });

    // describe("@sanity", () => {
    //     assert.strictEqual(1, 1);
    //     assert.notStrictEqual(1, 2);
    // });

    describe("happy flow", async () => {
        it("creates a signup code and stores it in db", async () => {
            const user = makeFakeUser({});

            const raw = await agent.postRequest("/api/v1/auth/code", { email: user.email, purpose: "signup" });
            assert.strictEqual(raw.status, 201);

            const correspondingRecords = await DbFx.doFindAllInCodesDb(db, user.email);
            assert.strictEqual(correspondingRecords.length == 1, true);

            const exp = correspondingRecords[0].expiresAt;
            assert.strictEqual(typeof exp === "number", true);
            // code should expire in 5 minutes. We check for 4 minutes.
            assert.strictEqual(exp > Date.now() + 4 * 60 * 1000, true);

            assert.strictEqual(correspondingRecords[0].purpose, "signup");
        });

        it.skip("creates a signup code and sends it via email (flaky)", async () => {
            //  Warning: concurrency is turned off in this test suite. Otherwise this test might fail.

            //  Since in previous tests, send email might be called several times (all of them use the same
            //  mocked send function), in order to de-couple this test we need to store current callCount.
            const sendCallCountBeforeRunningThisTest = spiedSendEmail.mock.callCount();

            const user = makeFakeUser({});
            const raw = await agent.postRequest("/api/v1/auth/code", { email: user.email, purpose: "signup" });

            assert.strictEqual(raw.status, 201);
            assert.strictEqual(spiedSendEmail.mock.callCount(), sendCallCountBeforeRunningThisTest + 1);
        });

        it("create a signup code and sends it to the correct email", async () => {
            const user = makeFakeUser({
                email: "_some_specific_email_@gmail.com"
            });
            const raw = await agent.postRequest("/api/v1/auth/code", { email: user.email, purpose: "signup" });

            console.log(emailsSentDuringTest);
            assert.strictEqual(raw.status, 201);
            assert.strictEqual(emailsSentDuringTest.map(({ email, body }) => (email)).includes(user.email), true);
        });


        // describe.todo("GIVEN supplied code and user profile details are valid", () => {

        //     // First create user raw and insert a code into codeDb

        //     it.todo("creates the user in db", async () => {

        //     });
        //     it.todo("sets session cookie");
        //     it.todo("returns user id");
        // });
    });

    // it.todo("returns 400 and does not create code if no email is supplied");
    // it.todo("returns 409 if given email already exists");

    after(async () => {
        // console.log("🚩 ".repeat(20));
        await DbFx.doCloseConnections(db);
        await promisify(server.close.bind(server))();
        // console.log("🎬 ".repeat(20));
    });
});


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").WebAppServer} WebAppServer
 */
