import path from "node:path";
import test, { describe, it, before, after } from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import makeDbConnectionPool from "../connection.js";
import makeRedisClient from "../cache-connection.js";
import make_find_session_record_by_hashedSessionId from "../find_session_record_by_hashedSessionId.js";
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


test("find session record by hashedSessionId", { concurrency: false }, async (t) => {
    let db;
    const user1 = { id: "a".repeat(24 /*since id column is CHAR(24)*/) };
    const user2 = { id: "b".repeat(24) };

    await t.before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM session_tbl;");
        await db.execute("DELETE FROM user_tbl;");
        await cacheClient.flushAll();
        await db.execute(`
            INSERT INTO
                user_tbl
                (id , email , hashed_password , display_name , birth_year , signup_at )
            VALUES
                  ( '${user1.id}' , 'user1@gmail.com' , REPEAT('a',60) , "user1" , 1391 , '2020-12-31 01:02:03' )
                , ( '${user2.id}' , 'user2@gmail.com' , REPEAT('b',60) , "user2" , 1392 , ADDDATE('2020-12-31 01:02:03', 31) )
            ;
        `);
    });

    await t.test("@sanity", () => {
        assert.strictEqual(1, 1);
    });

    await t.after(async () => {
        console.log("&".repeat(50));
        // await db.end();
        await dbConnectionPool.end();
        console.log("Hi");
        await cacheClient.QUIT();
    });
});



// check if expiresAt is number (not string or date) two separate tests:
//      - if it is inside cache.
//      - if it is retrieved directly from db. (more important, first test might be deleted)


//  all tests related to insert, delete and retrieval of a session. including cache.
//  it is important. because insert_session might not work properly with
//  find_from session (especially in timestamp field).
