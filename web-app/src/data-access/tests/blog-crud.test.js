import path from "node:path";
import test from "node:test";
import assert from "node:assert";
import dotenv from "dotenv";

import makeDbConnectionPool from "../connection.js";
import make_insert_blog from "../insert_blog.js";
import make_find_blog_record_by_blogId from "../find_blog_record_by_blogId.js";
import make_find_blog_records_paginated from "../find_blog_records_paginated.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "blog-crud.env"),
    override: true,
});

// ? Make sure MySQL is running in your machine.
// Now ...
const dbConnectionPool = makeDbConnectionPool({ port: Number(process.env.MYSQL_PORT) ?? 3306 });
const insert_blog = make_insert_blog({ dbConnectionPool });
const find_blog_record_by_blogId = make_find_blog_record_by_blogId({ dbConnectionPool });
const find_blog_records_paginated = make_find_blog_records_paginated({ dbConnectionPool });

test("Blog CRUD", { concurrency: false }, async (t) => {
    let db;
    const users = Object.freeze([
        { id: "a".repeat(24), email: "a_user0@gmail.com" },
        { id: "b".repeat(24), email: "b_user1@gmail.com" },
        { id: "c".repeat(24), email: "c_user2@gmail.com" },
    ]);

    await t.before(async () => {
        db = await dbConnectionPool;
        await db.execute("DELETE FROM blog_tbl;");
        await db.execute("DELETE FROM user_tbl;");

        //  populate user_tbl
        //  In order to de-couple this test suite from user queries, we aren't using [insert_user].
        let rawSqlCmd = `
            INSERT INTO
                    user_tbl
                    (id , email , hashed_password , display_name , birth_year , signup_at )
            VALUES
        `;
        for (let i = 0; i < users.length; i++) {
            if (i > 0) rawSqlCmd += ", ";
            rawSqlCmd += `( '${users[i].id}' , '${users[i].email}' , REPEAT('a',60) , 'user${i}' , 1360 , '2020-12-31 01:02:03' )`;
        }
        rawSqlCmd += ";";
        await db.execute(rawSqlCmd);
    });

    await /*crucial*/ t.test("@sanity", () => {
        assert.strictEqual(3, 3);
    });

    await t.test("inserts a blog and finds it by id", async () => {
        //  It is ok to test both query functions in same test case. If any of the fails the test will fail which is
        //  actually to our benefit.
        const blog1 = {
            id: "01".repeat(12 /*should be 24 chars*/),
            authorId: users[0].id,
            blogTitle: "یک عنوان دلخواه",
            blogBody: "متن دلخواه",
            blogTopic: "آشپزی",
            imageUrl: null,
            isPublished: true,
            createdAt: new Date("2020-12-28T01:02:03+00:00").getTime(),
            modifiedAt: new Date("2021-01-01T01:02:03+00:00").getTime(),
        };
        await insert_blog(blog1);
        const record = await find_blog_record_by_blogId({ blogId: blog1.id });

        assert.strictEqual(record == null, false);
        assert.strictEqual(record?.blogTopic, blog1.blogTopic);
        assert.strictEqual(record.createdAt, blog1.createdAt);
        assert.strictEqual(record.modifiedAt, blog1.modifiedAt);
    });

    await t.after(async () => {
        await dbConnectionPool.end();
    });
});
