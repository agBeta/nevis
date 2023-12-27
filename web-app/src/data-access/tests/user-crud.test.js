// @ts-nocheck
import path from "node:path";
import test from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import makeDbConnectionPool from "../connection.js";
import make_find_user_records_by_email from "../find_user_records_by_email.js";
import make_insert_user from "../insert_user.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "user-crud.env"),
    override: true,
});

// ? Make sure MySQL and redis server are running in your machine.
// Now ...
const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) ?? 3306 });

const insert_user = make_insert_user({ dbConnectionPool });
const find_user_records_by_email = make_find_user_records_by_email({ dbConnectionPool });

test("User CRUD", { concurrency: false }, async (t) => {
    let db;
    //  We declare users here, since when they are inserted into db, they won't get deleted.
    const user1 = Object.freeze({
        id: "a".repeat(24),
        email: "a_user1@gmail.com",
        hashedPassword: "h1".repeat(30),
        displayName: "user1",
        birthYear: 1380,
        signupAt: new Date("2019-08-02T15:30:00+02:30"),
    });
    const user2 = Object.freeze({
        id: "b".repeat(24),
        email: "b_user2@gmail.com",
        hashedPassword: "h2".repeat(30),
        displayName: "user2",
        birthYear: 1384,
        signupAt: new Date("2022-11-12T20:30:00-01:00"),
    });

    await t.before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM user_tbl;");
    });

    await t.test("inserts new user", async () => {
        await insert_user({
            ...user1,
            signupAt: user1.signupAt.getTime(),
        });
        //  We don't want to use find_user_.. here, though using it is also ok and to our benefit (in case of failure).
        //  But let's keep this test as isolated as possible.
        db = await dbConnectionPool;
        const [resultOfSelectAll, ] = await db.execute("SELECT * FROM user_tbl;");
        assert.strictEqual(resultOfSelectAll.length === 1, true);

        const u = resultOfSelectAll[0];
        assert.strictEqual(u.id, user1.id);
        assert.strictEqual(u.hashed_password, user1.hashedPassword);
        // Definitely date values aren't reference-equal. So...
        const signup_at = u.signup_at;
        assert.strictEqual(signup_at.getTime() - user1.signupAt.getTime(), 0);
    });

    await t.test("should should throw error when signupAt is native Date (i.e. isn't timestamp number)", async () => {
        assert.rejects(async function call_insert_user_with_native_date_parameter() {
            // @ts-ignore
            await insert_user(user2);
        }, {
            message: /signupAt/i,
            name: /invalid/i,
        });
    });

    t.todo("should let us insert another user with case-sensitive email");

    await t.after(async() => {
        await dbConnectionPool.end();
    });
});

/**
 * @typedef {import("#types").User} User
 */
