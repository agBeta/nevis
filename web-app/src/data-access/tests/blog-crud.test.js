import path from "node:path";
import test from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import makeDbConnectionPool from "../connection.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "blog-crud.env"),
    override: true,
});

// ? Make sure MySQL is running in your machine.
// Now ...
const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) ?? 3306 });


test("Blog CRUD", { concurrency: false }, async (t) => {
    let db;

    await t.before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM blog_tbl;");
        await db.execute("DELETE FROM user_tbl;");
    });

    await /*crucial*/ t.test("@sanity", () => {
        assert.strictEqual(3, 3);
    });

    await t.after(async() => {
        await dbConnectionPool.end();
    });
});
