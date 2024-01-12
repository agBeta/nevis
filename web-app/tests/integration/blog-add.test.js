import path from "node:path";
import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as http from "node:http";
import { promisify } from "node:util";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import make_find_blog_record_by_blogId from "#da/queries/find_blog_record_by_blogId.js";
import make_find_action_record_by_actionId from "#da/queries/find_action_record_by_actionId.js";
import { makeFakeBlog } from "../fixtures/blog.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "..", "configs", "blog-add.env"),
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

const find_blog_record_by_blogId = make_find_blog_record_by_blogId({ dbConnectionPool });
const find_action_record_by_actionId = make_find_action_record_by_actionId({ dbConnectionPool });




describe("Blog Add", { concurrency: false, timeout: 8000 }, () => {
    let /** @type {WebAppServer} */ server;
    let db;

    //  For better understanding and (why) comments, see user-login.test
    //  But of course, there are some comments added particularly for this test suite.

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
        await db.execute("DELETE FROM blog_tbl;");
        await db.execute("DELETE FROM action_tbl;");

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

    describe("Given user1 is logged in", { concurrency: false }, async () => {
        //  For these subtests, the assumption (Given ...) must be satisfied.

        //  NOTE: Recall, test cases in this test file are executed serially (not concurrently).
        //  Otherwise, there might be some issues since cookies would be overwritten by another test
        //  case and authentication middleware wouldn't let the request fo pass through.
        //  Also note, each test file creates its own client, so theoretically it's ok to run test
        //  files in parallel, but test cases in each file should be executed sequentially.

        before(async function loginAsUser1(){
            //  🔷 NOTE: we MUST do any asynchronous task inside [before] hook. Otherwise this
            //  subtest won't work (actually the [after] block will be executed, server will be
            //  closed and we don't even get the chance to login). Not sure why.

            await client.postRequest("/api/v1/auth/login", {
                email: user1.email,
                password: user1.password,
                rememberMe: false,
            });
        });


        it("creates an action and stores action in db", async () => {
            const result = await client.postRequest("/api/v1/blog/", {});
            assert.strictEqual(result.statusCode, 201);
            assert.strictEqual(result.headers.get("Location")?.includes("blog/action"), true);
            const response = result.response;
            assert.strictEqual(response.success, true);
            assert.strictEqual(typeof response.actionId === "string", true);

            const actionId = response.actionId;
            const record = await find_action_record_by_actionId({ actionId });
            assert.strictEqual(record?.id, actionId);
            assert.strictEqual(record?.userId, user1.id);
            //  We don't check [purpose]. Consumer of the API doesn't care about purpose. but [state] is important
            //  for the consumer. Incorrect state would result in wrong behavior.
            assert.strictEqual(record?.state, 1 /*=not initiated, according to constants.js in controllers*/);
            //  The action should have quite long lifespan.
            assert.strictEqual(record?.expiresAt - Date.now() > 11 * 60 * 60 * 1000, true);
            //  but not too long...
            assert.strictEqual(record?.expiresAt - Date.now() < 13 * 60 * 60 * 1000, true);
        });

        it("creates a new blog by PUT action and stores the blog in db", async () => {
            // We create a brand-new action, to isolate this test case from the previous.
            const actionId = (await client.postRequest("/api/v1/blog/", {})).response.actionId;

            const body = makeFakeBlog({ blogTitle: "یک عنوان جالب" + " " + "🎂" });
            const result = await client.putRequest(`/api/v1/blog/action/${actionId}`, body);
            assert.strictEqual(result.statusCode, 201);
            const blogId = result.response.blogId;
            assert.strictEqual(blogId == null, false);
            assert.strictEqual(result.headers.get("Location"), `/blog/${blogId}`);

            const record = await find_blog_record_by_blogId({ blogId });
            assert.strictEqual(record == null, false);
            assert.strictEqual(record?.id == blogId, true);

            // Check authorId is same as logged-in user
            assert.strictEqual(record?.authorId, user1.id);
            // createdAt should be something around now (5 seconds tolerance)
            assert.strictEqual(Math.abs(record?.createdAt - Date.now()) < 5000, true);
            // blog title should be encoded/decoded correctly along the way from API, stringify, db, etc.
            assert.strictEqual(record.blogTitle.includes("🎂") && record.blogTitle.includes("عنوان"), true);
        });

        it("returns 400 when blog details are invalid", async () => {
            const actionId = (await client.postRequest("/api/v1/blog/", {})).response.actionId;
            const body = makeFakeBlog({});
            delete body.blogTitle; // making body invalid
            const result = await client.putRequest(`/api/v1/blog/action/${actionId}`, body);
            assert.strictEqual(result.statusCode, 400);
            assert.strictEqual(result.response.success, false);
            assert.strictEqual(result.response.error.includes("blogTitle"), true);
            assert.strictEqual(result.response.error.includes("required"), true);
        });

    });

    it("should return 401 and shouldn't create action when not authenticated", async() => {
        // First, let's clear cookies that are stored from previous test cases.
        client.clearCookies();
        const result = await client.postRequest("/api/v1/blog/", {});
        assert.strictEqual(result.statusCode, 401);
        assert.strictEqual(result.response.success, false);
        assert.strictEqual(result.response.error.includes("Not authenticated"), true);
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
