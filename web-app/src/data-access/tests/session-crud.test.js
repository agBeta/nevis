import path from "node:path";
import test, { mock } from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import makeDbConnectionPool from "../connection.js";
import makeRedisClient from "../cache-connection.js";
import make_find_session_record_by_hashedSessionId from "../find_session_record_by_hashedSessionId.js";
import make_remove_session_record_by_hashedSessionId from "../remove_session_record_by_hashedSessionId.js";
import make_insert_session from "../insert_session.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "session-crud.env"),
    override: true,
});

// ? Make sure MySQL and redis server are running in your machine.
// Now ...
const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) ?? 3306 });
const cacheClient = await makeRedisClient();

const insert_session = make_insert_session({ dbConnectionPool });
const find_session_record_by_hashedSessionId = make_find_session_record_by_hashedSessionId({
    dbConnectionPool,
    cacheClient
});
const remove_session_record_by_hashedSessionId = make_remove_session_record_by_hashedSessionId({
    dbConnectionPool,
    cacheClient,
});

test("Session CRUD", { concurrency: false }, async (t) => {
    let db;
    const user1 = { id: "a".repeat(24 /*since id column is CHAR(24)*/) };
    const user2 = { id: "b".repeat(24) };

    await t.before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM session_tbl;");
        await db.execute("DELETE FROM user_tbl;");
        // For simplicity don't use Promise.all(..).
        await db.execute(`
            INSERT INTO
                user_tbl
                (id , email , hashed_password , display_name , birth_year , signup_at )
            VALUES
                  ( '${user1.id}' , 'user1@gmail.com' , REPEAT('a',60) , 'user1' , 1391 , '2020-12-31 01:02:03' )
                , ( '${user2.id}' , 'user2@gmail.com' , REPEAT('b',60) , 'user2' , 1392 , ADDDATE('2020-12-31 01:02:03', 31) )
            ;
        `);
        await cacheClient.flushAll();
    });

    await t.test("@sanity", () => {
        assert.strictEqual(1, 1);
    });

    await t.test("inserts session for user1 and doesn't throw any errors", async () => {
        const /**@type {Session}*/ session = {
            hashedSessionId: "s1".repeat(12 /*should be 24 characters*/),
            userId: user1.id,
            expiresAt: Date.now() + (/*10 minutes later*/10 * 60 * 1000)
        };
        await insert_session(session);
    });

    await t.test("inserts session for user2 and finds it", async () => {
        const /**@type {Session}*/ session = Object.freeze({
            hashedSessionId: "s2".repeat(12),
            userId: user2.id,
            expiresAt: Date.now() + (10 * 60 * 1000)
        });
        await insert_session(session);
        const record = await find_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        // Note, typeof null is object. So don't check that.
        assert.strictEqual(record == null, false);
        assert.strictEqual(record?.userId, user2.id);

        //  🔷 The following test is crucial for consistency of codebase.
        //  expiresAt shouldn't be native JS Date. It should be number to prevent any inconsistency throughout codebase.
        assert.strictEqual(typeof record.expiresAt === "number", true);
        //  🔷 The following tests prevent expiresAt to be timestamp in seconds (MySQL UNIX_TIMESTAMP returns timestamp
        //  in seconds).
        //  expiresAt should be in milliseconds.
        assert.strictEqual(record.expiresAt - Date.now() > 9 * 60 * 1000, true);
        // Don't use exact 10*60*1000, since Date.now() seems to be a bit inaccurate.
        assert.strictEqual(record.expiresAt - Date.now() <= 10 * 60 * 1000 + /*5 more seconds*/5000, true);
    });

    await t.test("should let us insert another session for user1, without throwing any errors", async () => {
        const /**@type {Session}*/ session = {
            hashedSessionId: "s3".repeat(12),
            userId: user1.id,
            expiresAt: Date.now() + (10 * 60 * 1000)
        };
        await insert_session(session);
        const record = await find_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        assert.strictEqual(record?.userId, user1.id);
    });

    await t.test("should use cache the second time we try to find session", async () => {
        const /**@type {Session}*/ session = Object.freeze({
            hashedSessionId: "s9".repeat(12),
            userId: user1.id,
            expiresAt: Date.now() + (4 * 60 * 1000)
        });
        await insert_session(session);

        const record = await find_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        assert.strictEqual(record?.userId, user1.id);
        //  We cannot end connection and reopen it. See https://stackoverflow.com/questions/25072228/nodejs-mysql-how-can-i-reopen-mysql-after-end.
        //  So the idea (thank God) is to delete session from database and call find_... one again. If it returns the
        //  session it means the cache is working.
        db = await dbConnectionPool;
        const /**@type {[ResultSetHeader, any]}*/[resultSetHeader,] = await db.execute(
            `DELETE FROM session_tbl WHERE hashed_session_id = '${session.hashedSessionId}' ;`
        );
        // First check if it is indeed deleted from database
        assert.strictEqual(resultSetHeader.affectedRows, 1);
        // Now ...
        const again = await find_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        assert.strictEqual(again == null, false);
        assert.strictEqual(again?.hashedSessionId, session.hashedSessionId);
        assert.strictEqual(again?.userId, session.userId);

        //  🔷 Don't use exact equality check for timestamp, i.e. Don't check again.expiresAt==session.expiresAt.
        //  Since MySQL by default stores timestamp only with precision 1 (i.e. in seconds), so session.expiresAt
        //  might get rounded up/down when inserted into MySQL database. So...
        assert.strictEqual(Math.abs(again?.expiresAt - session.expiresAt) <= 1000, true);
    });

    await t.test("should remove the session from both database and cache", async () => {
        // First let's insert it.
        const /**@type {Session}*/ session = Object.freeze({
            hashedSessionId: "sR".repeat(12),
            userId: user1.id,
            expiresAt: Date.now() + (4 * 60 * 1000)
        });
        await insert_session(session);
        // Now let's retrieve it once, so that it will be cached.
        await find_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        // Double check the cache to make sure it is indeed cached.
        let resFromCache = await cacheClient.GET(`session:${session.hashedSessionId}`);
        assert.strictEqual(resFromCache == null, false);

        //  Now we remove it.
        await remove_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        //  The best assertion is that when we try to find it again, it returns null.
        const res = await find_session_record_by_hashedSessionId({ hashedSessionId: session.hashedSessionId });
        assert.strictEqual(res == null, true);

        // Double check by asking the cache.
        resFromCache = await cacheClient.GET(`session:${session.hashedSessionId}`);
        assert.strictEqual(resFromCache == null, true);
    });

    await t.after(async () => {
        // It might be necessary to: await db.end();
        // Based on https://github.com/mysqljs/mysql/blob/master/Readme.md#terminating-connections.
        await dbConnectionPool.end();
        await cacheClient.QUIT();
    });
});

/**
 * @typedef {import("#types").Session} Session
 * @typedef {import("mysql2").ResultSetHeader} ResultSetHeader
 */
