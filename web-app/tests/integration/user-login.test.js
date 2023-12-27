import path from "node:path";
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as http from "node:http";
import { promisify } from "node:util";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import make_insert_user from "../../src/data-access/insert_user.js";
import make_insert_session from "../../src/data-access/insert_session.js";
import make_find_session_record_by_hashedSessionId from "../../src/data-access/find_session_record_by_hashedSessionId.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "..", "configs", "user-login.env"),
    override: true
});

const makeDbConnectionPool = (await import("../../src/data-access/connection.js")).default;
const { installRouter, makeExpressApp } = await import("../../src/express-stuff/server.js");
const authRouter = (await import("../../src/routes/auth-router.js")).router;
const { makeFakeUser } = await import("../fixtures/user.js");
const makeHttpClient = (await import("../fixtures/http-client.js")).default;
const doListen = (await import("../fixtures/listen.js")).default;

const PORT = Number(process.env.PORT);
const agent = makeHttpClient({ port: PORT });

const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) });
const insert_user = make_insert_user({ dbConnectionPool });
const insert_session = make_insert_session({ dbConnectionPool });
const find_session_record_by_hashedSessionId = make_find_session_record_by_hashedSessionId({
    dbConnectionPool,
    cacheClient: null,
});


describe("User Login", { concurrency: false, timeout: 8000 }, () => {
    let /** @type {WebAppServer} */ server;
    let db;
    //  These are skeleton of two users that will be insert to db in [before] hook and are used in
    //  test cases. Only relevant information (id, email, password) is provided. We will assign some
    //  default value for other fields (birthYear, etc).
    let user1 = {
        id: "a".repeat(24),
        email: "user1_1@gmail.com",
        password: "pass1",
    };
    let user2 = {
        id: "b".repeat(24),
        email: "user2_2@gmail.com",
        password: "pass2",
    };

    before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM session_tbl;");
        await db.execute("DELETE FROM user_tbl;");

        // NOTE, you must the same hash function that is used inside auth-signup controller.
        const hc1 = await bcrypt.hash(user1.password, 9);
        const hc2 = await bcrypt.hash(user2.password, 9);

        // We don't use prepared statement. Raw sql is more transparent.
        await db.execute(`
            INSERT INTO
                user_tbl
                (id , email , hashed_password , display_name , birth_year , signup_at )
            VALUES
                  ( '${user1.id}' , '${user1.email}' , '${hc1}' , 'user1' , 1391 , '2020-12-31 01:02:03' )
                , ( '${user2.id}' , '${user2.email}' , '${hc2}' , 'user2' , 1392 , '2020-12-20 01:02:03' )
            ;
        `);

        const app = makeExpressApp();
        installRouter({ app, router: authRouter, pathPrefix: "/api/v1/auth" });
        server = http.createServer(app);
        await doListen(server, PORT);
        console.log("before hook finished.", " 🚀 ".repeat(10));
    });

    it("@sanity", () => {
        assert.strictEqual(3, 3);
        assert.notStrictEqual(1, 2);
    });

    it("returns 200 along with userId when given email,password are correct", async() => {
        const raw = await agent.postRequest("/api/v1/auth/login", {
            email: user1.email,
            password: user1.password,
            rememberMe: false,
        });

        assert.strictEqual(raw.status, 200);
        // Cache-Control: no-store is important for security. So we must check it.
        assert.strictEqual(raw.headers.get("Cache-Control"), "no-store");

        const response = await raw.json();
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.userId, user1.id);
    });

    after(async () => {
        await dbConnectionPool.end();
        await promisify(server.close.bind(server))();
        console.log("after hook finished.", " 🚩🎬 ".repeat(10));
    });
});


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").WebAppServer} WebAppServer
 */
