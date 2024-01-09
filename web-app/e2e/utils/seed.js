import path from "node:path";
import fsPromises from "node:fs/promises";
import { pathToFileURL } from "url";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker/locale/fa";
import makeDbConnectionPool from "../../src/data-access/connection.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "..", /*-->*/ "e2e.env"),
    override: true,
});

export const dbConnectionPool = makeDbConnectionPool({ port: 3306 });

// To have reproducible result
faker.seed(100);


if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    // So this module wasn't imported, but called directly (i.e. via cli "node seed.js").
    // Condition is based on https://stackoverflow.com/a/68848622.

    await clearAll();
    const userIds = await seedUsers(10);
    await seedBlogs(userIds, 50);
    dbConnectionPool.end();
}


export async function clearAll() {
    const db = await dbConnectionPool;
    await db.execute("DELETE FROM user_tbl;");
    await db.execute("DELETE FROM session_tbl;");
    await db.execute("DELETE FROM code_tbl;");
}

export async function seedUsers(n = 10, saveAsFixtureFile = false) {

    /**@type {null | import("node:fs/promises").FileHandle}*/
    let fileHandle = null;

    if (saveAsFixtureFile) {
        const pathOfFixtureFile = path.resolve(
            new URL(".", import.meta.url).pathname, "..", "fixtures", "users.json"
        );
        // We must delete existing fixture file.
        await deleteFileIfExists(pathOfFixtureFile);
        fileHandle = await fsPromises.open(pathOfFixtureFile, "a");
    }

    //  We cannot use the pool directly to begin a transaction like you can be for a query.
    //  See links at the end of this file for more information.
    const cn = await dbConnectionPool.getConnection();
    await cn.beginTransaction();
    const users = [];

    for (let i = 0; i < n; i++) {
        //  We cannot use makeFakeUser from fixtures, since that function create a user from POV of client,
        //  unlike here that we are adding directly to database.

        const user = {
            id: randomBytes(12).toString("hex"), // 24 characters
            // well-formed predictable email and password so that automated e2e tests can login.
            email: `email_of_${i}@mail.com`,
            password: `pass_user_${i}`,
            displayName: faker.person.fullName(),
            birthYear: faker.number.int({ min: 1330, max: 1395 }),
            signupAt: faker.date.between({
                from: "2018-01-01T00:00:00.000Z",
                to: "2023-12-20T00:00:00.000Z"
            }),
        };
        users.push(user);

        // NOTE, you must the same hash function that is used inside auth-signup controller.
        const h = await bcrypt.hash(user.password, 9);

        await cn.query(`
            INSERT INTO user_tbl
                (id, email, hashed_password, display_name, birth_year, signup_at)
                VALUES (?, ?, ?, ?, ?, ?) ;
        `, [user.id, user.email, h, user.displayName, user.birthYear, user.signupAt]);
    }

    await cn.commit();

    if (fileHandle != null /*i.e. saveAsFixtureFile is true*/) {
        // No try/catch block. We want to fail if it cannot write users to fixture file.
        fileHandle.write(JSON.stringify(users));
        await fileHandle.close();
    }

    return users.map(u => u.id);
}

/** @param {string[]} userIds */
export async function seedBlogs(userIds, n = 50) {
    const cn = await dbConnectionPool.getConnection();
    await cn.beginTransaction();

    // The blogs must be added chronologically, i.e. in ASC (actually "not DESC" to be precise) order of [createdAt].
    let /**@type {Date}*/ previousBlogCreatedAt;

    let sqlCmd = `
        INSERT INTO blog_tbl
            (   id,           author_id,   blog_title,
                blog_body,    blog_topic,  image_url,
                is_published, created_at,  modified_at
            )
            VALUES
    `;

    for (let i = 0; i < n; i++) {
        const blog = {
            id: randomBytes(12).toString("hex"),
            authorId: randomAuthorId(),
            blogTitle: faker.lorem.words({ min: 2, max: 5 }),
            blogBody: faker.lorem.lines({ min: 10, max: 20 }),
            blogTopic: "Technology",
            imageUrl: null,
            isPublished: true,
            createdAt: i == 0 ? new Date("2020-01-01T00:00:00.000Z") : faker.date.between({
                // @ts-ignore
                from: previousBlogCreatedAt,
                // @ts-ignore
                to: new Date(previousBlogCreatedAt.getTime() + /*20 days*/1000 * 60 * 60 * 24 * 20),
            }),
            modifiedAt: new Date(),
        };
        previousBlogCreatedAt = blog.createdAt;
        // @ts-ignore
        blog.modifiedAt = new Date(blog.createdAt);

        if (i > 0) sqlCmd += "\n ,";
        sqlCmd += `
            (   '${blog.id}',        '${blog.authorId}',   '${blog.blogTitle}',
                '${blog.blogBody}',   '${blog.blogTopic}',  '${blog.imageUrl}',
                TRUE,
                '${convertToMySQLDatetime(blog.createdAt)}',
                '${convertToMySQLDatetime(blog.modifiedAt)}'
            )
        `;
    }

    sqlCmd += ";";
    await cn.query(sqlCmd, []);
    await cn.commit();

    function randomAuthorId() {
        return userIds[Math.floor(Math.random() * userIds.length)];
    }
    function convertToMySQLDatetime(/**@type {Date}*/d) {
        //  Based on "Paulo Roberto Rosa" comment in https://stackoverflow.com/questions/5129624/convert-js-date-time-to-mysql-datetime
        //  This seems to also account timezone.
        return d.toISOString().split("T")[0] + " " + d.toTimeString().split(" ")[0];
    }
}


async function deleteFileIfExists(/**@type {string}*/pathToFile) {
    try {
        await fsPromises.unlink(pathToFile);
    }
    catch (err) {
        if (err.code === "ENOENT") {
            // No such file. No need to do anything.
        } else {
            //  So there was some real issue.
            //  We want to fail if it cannot delete any (fixture) file. So we raise an error without
            //  catching it.
            throw new Error("Could not delete the file: " + err);
        }
    }
}

/** For mysql transactions take a look at:
        https://stackoverflow.com/a/38717014
        https://stackoverflow.com/a/70240338
        https://github.com/sidorares/node-mysql2/issues/384#issuecomment-543727621
 */

/*  Side about opening a file:
    Unlike fsPromises that returns a file handle, openSync(..) returns a file descriptor
    See also https://stackoverflow.com/a/16106756 to learn about working with file descriptor.
*/
