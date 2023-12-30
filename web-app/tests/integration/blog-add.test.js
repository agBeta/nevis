// For better understanding and comments, it's recommended to see user-signup.test and user-login.test
import path from "node:path";
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as http from "node:http";
import { promisify } from "node:util";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "..", "configs", "user-login.env"),
    override: true
});

const makeDbConnectionPool = (await import("../../src/data-access/connection.js")).default;
const { installRouter, makeExpressApp } = await import("../../src/express-stuff/server.js");
const authRouter = (await import("../../src/routes/auth-router.js")).router;
const blogRouter = (await import("../../src/routes/blog-router.js")).router;
const makeHttpClient = (await import("../fixtures/http-client.js")).default;
const doListen = (await import("../fixtures/listen.js")).default;

const PORT = Number(process.env.PORT);
const client = makeHttpClient({ port: PORT });

const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) });


describe("User Login", { concurrency: false, timeout: 8000 }, () => {
    let /** @type {WebAppServer} */ server;
    let db;
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
        // For better understanding and comments, see user-login.test
        db = await dbConnectionPool;
        await db.execute("DELETE FROM blog_tbl;");
        await db.execute("DELETE FROM session_tbl;");
        await db.execute("DELETE FROM user_tbl;");

        const hc1 = await bcrypt.hash(user1.password, 9);
        const hc2 = await bcrypt.hash(user2.password, 9);

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
        installRouter({ app, router: blogRouter, pathPrefix: "/api/v1/blog" });
        server = http.createServer(app);
        await doListen(server, PORT);
        // console.log("before hook finished.", " 🚀 ".repeat(10));
    });

    it("@sanity", () => {
        assert.strictEqual(3, 3);
        assert.notStrictEqual(1, 2);
    });

    after(async () => {
        await dbConnectionPool.end();
        await promisify(server.close.bind(server))();
        // console.log("after hook finished.", " 🚩🎬 ".repeat(10));
    });
});


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").WebAppServer} WebAppServer
 */
