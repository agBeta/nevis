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
const client = makeHttpClient({ port: PORT });

const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) });
const insert_user = make_insert_user({ dbConnectionPool });
const insert_session = make_insert_session({ dbConnectionPool });
const find_session_record_by_hashedSessionId = make_find_session_record_by_hashedSessionId({
    dbConnectionPool,
    // We disabled cache in env file.
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
    let user3 = {
        id: "c".repeat(24),
        email: "user3_3@gmail.com",
        password: "pass3",
    };

    before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM session_tbl;");
        await db.execute("DELETE FROM user_tbl;");

        // NOTE, you must the same hash function that is used inside auth-signup controller.
        const hc1 = await bcrypt.hash(user1.password, 9);
        const hc2 = await bcrypt.hash(user2.password, 9);
        const hc3 = await bcrypt.hash(user3.password, 9);

        // We don't use prepared statement. Raw sql is more transparent.
        await db.execute(`
            INSERT INTO
                user_tbl
                (id , email , hashed_password , display_name , birth_year , signup_at )
            VALUES
                  ( '${user1.id}' , '${user1.email}' , '${hc1}' , 'user1' , 1391 , '2020-12-31 01:02:03' )
                , ( '${user2.id}' , '${user2.email}' , '${hc2}' , 'user2' , 1392 , '2020-12-20 01:02:03' )
                , ( '${user3.id}' , '${user3.email}' , '${hc3}' , 'user3' , 1393 , '2020-12-20 01:02:03' )
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

    it("returns 200 along with userId when given email,password are correct", async () => {
        const raw = await client.postRequest("/api/v1/auth/login", {
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

    it("returns 401 when given email,password are incorrect", async () => {
        const raw = await client.postRequest("/api/v1/auth/login", {
            email: user1.email,
            password: user2/*<--*/.password,
            rememberMe: false,
        });
        assert.strictEqual(raw.status, 401);
        const response = await raw.json();
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.error == null, false);
        assert.strictEqual(response.error.includes("email or password"), true);
    });

    // This test makes sure the controller won't end up executing slow downstream functions.
    it("returns 400 when given password is too long or isn't supplied", async () => {
        // password isn't given
        let raw = await client.postRequest("/api/v1/auth/login", {
            email: user1.email,
            /*no password is provided*/
            rememberMe: false,
        });
        assert.strictEqual(raw.status, 400);
        let response = await raw.json();
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.error.toLowerCase().includes("bad request"), true);
        assert.strictEqual(response.error.includes("password") && response.error.includes("required"), true);


        raw = await client.postRequest("/api/v1/auth/login", {
            email: user1.email,
            password: user1.password.repeat(20 /*long password*/),
            rememberMe: false,
        });
        assert.strictEqual(raw.status, 400);
        response = await raw.json();
        assert.strictEqual(response.success, false);
        assert.strictEqual(response.error.toLowerCase().includes("bad request"), true);
    });

    it("sets session cookie when given email,password are correct", async () => {
        //  it's better to login as user2, since we already have logged in as user1 in previous test and
        //  that might cause some false positives. Not sure. Anyway...
        const raw = await client.postRequest("/api/v1/auth/login", {
            email: user2.email,
            password: user2.password,
            rememberMe: false,
        });
        assert.strictEqual(raw.status, 200);
        const cookies = raw.headers.getSetCookie();
        assert.strictEqual(cookies.length, 2);

        //  cookies[0] should be like:
        //  __Host-nevis_session_id=...; Max-Age=...; Path=/; Expires=Thu, ...; ...
        const sessionCookieParts = cookies[0].split(";")
            /* if we don't trim, they would be like " Max-Age=..", i.e. extra white space at the beginning. */
            .map(s => s.trim());
        assert.strictEqual(sessionCookieParts[0].split("=")[0], "__Host-nevis_session_id");

        //  sessionId should be quite long. To make the test more robust, we didn't specify the exact
        //  length (which is 32 according to controllers/index.js).
        assert.strictEqual(sessionCookieParts[0].split("=")[1].length > 20, true);

        assert.strictEqual(sessionCookieParts[1].toLocaleLowerCase().includes("max-age"), true);
        const valueOfMaxAge = Number(sessionCookieParts[1].split("=")[1]);
        // max-age should be 3 hours when rememberMe=false.
        assert.strictEqual(valueOfMaxAge, 3 * 60 * 60);

        // session cookie shouldn't be accessible from browser javascript.
        assert.strictEqual(sessionCookieParts.includes("HttpOnly"), true);

        const roleCookieParts = cookies[1].split(";").map(s => s.trim());
        assert.strictEqual(roleCookieParts[0], "__Host-nevis_role=user");
        // role cookie should be accessible from browser javascript.
        assert.strictEqual(roleCookieParts.includes("HttpOnly"), false);
    });

    it("given user is logged in, authenticated_as should return user id", async () => {
        //  First we need to satisfy the assumption (i.e. given user is logged in).
        //  We log in as user3 to isolate this test from previous ones.
        let raw = await client.postRequest("/api/v1/auth/login", {
            email: user3.email,
            password: user3.password,
            rememberMe: false,
        });
        assert.strictEqual(raw.status, 200);

        const result = await client.getRequest("/api/v1/auth/authenticated_as");
        assert.strictEqual(result.statusCode, 200);
        assert.strictEqual(result.headers.get("Cache-Control"), "no-store");

        const response = result.response;
        assert.strictEqual(response.success, true);
        assert.strictEqual(response.userId, user3.id);
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
