// These seed are used for e2e tests.
import path from "node:path";
import { randomBytes } from "node:crypto";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker/locale/fa";
import makeDbConnectionPool from "#da/connection.js";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, /*-->*/ "e2e.env"),
    override: true,
});
const dbConnectionPool = makeDbConnectionPool({ port: 3306 });

faker.seed(100);
const userIds = await seedUsers(10);
await seedBlogs(userIds, 50);


async function seedUsers(n = 10) {
    //  For transactions take a look at:
    //  https://stackoverflow.com/a/70240338
    //  https://github.com/sidorares/node-mysql2/issues/384#issuecomment-543727621

    const db = await dbConnectionPool.getConnection();
    await db.beginTransaction();

    for (let i = 0; i < n; i++) {
        const user = {
            id: randomBytes(12).toString("hex"), // 24 characters
            // well-formed predictable email and password so that automated e2e tests can login.
            email: `email_of_${i}@mail.com`,
            password: `pass_user_${i}`,
            displayName: faker.person.fullName(),
            birthYear: faker.number.int({ min: 1330, max: 1395 }),
            signupAt: faker.date.between({
                from: "2020-01-01T00:00:00.000Z",
                to: "2023-12-20T00:00:00.000Z"
            })
        };
        // NOTE, you must the same hash function that is used inside auth-signup controller.
        const hc = await bcrypt.hash(user.password, 9);
        db.query(`
            INSERT INTO user_tbl ()
        `);
    }

    await db.commit();
}

/** @param {string[]} usersId */
async function seedBlogs(usersId, n = 50) {

}
