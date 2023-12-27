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

    before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM session_tbl;");
        await db.execute("DELETE FROM user_tbl;");
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
