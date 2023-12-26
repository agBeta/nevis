import path from "node:path";
import { test } from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import make_find_session_record_by_hashedSessionId from "./find_session_record_by_hashedSessionId.js";
import makeDbConnectionPool from "./connection.js";
import makeRedisClient from "./cache-connection.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "test-configs", "session-CRUD.env"),
    override: true
});

const dbConnectionPool = makeDbConnectionPool({ port: 3306 });
const find_session_record_by_hashedSessionId = make_find_session_record_by_hashedSessionId({

});

test("find session record by hashedSessionId", { concurrency: false, timeout: 6000 }, async (t) => {
});


// check if expiresAt is number (not string or date) two separate tests:
//      - if it is inside cache.
//      - if it is retrieved directly from db. (more important, first test might be deleted)


//  all tests related to insert, delete and retrieval of a session. including cache.
//  it is important. because insert_session might not work properly with
//  find_from session (especially in timestamp field).
