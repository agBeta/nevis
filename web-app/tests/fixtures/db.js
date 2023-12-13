import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

//  We won't any data-access implementation (i.e. src/data-access) here. It leads to coupling their implementation with
//  test.

const dbName = process.env.MYSQL_DB_NAME;
if (!dbName) throw new Error("Database connection must have a valid database name.");

const dbConnectionPool = mysql.createPool({
    host: "localhost",
    database: dbName.concat("_test"),
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: 3,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    timezone: "+03:30",
    charset: "utf8mb4_unicode_ci"
});


/**
 * @param {"codes" | "auth_sessions" | "users" | "posts" | "all"} [name="all"]
 */
export async function clearDb(name = "all") {
    const db = await dbConnectionPool;

    switch (name) {
        case "all":
            //  Although deleting users will be enough, since every other table has a foreign key to users_tbl. But who
            //  tests the test? Let's keep it simple and do all.
            await db.execute("DELETE from auth_sessions_tbl;", []);
            await db.execute("DELETE from codes_tbl;", []);
            await db.execute("DELETE from posts_tbl;", []);
            await db.execute("DELETE from users_tbl;", []);
            break;

        case "codes":
            await db.execute("DELETE from codes_tbl;", []);
            break;
        case "users":
            await db.execute("DELETE from users_tbl;", []);
            break;
        case "posts":
            await db.execute("DELETE from posts_tbl;", []);
            break;
        case "auth_sessions":
            await db.execute("DELETE from auth_sessions_tbl;", []);
            break;
    }
}


/**
 * @param {string} email
 * @returns {Promise<any[]>}
 */
export async function findInCodesDb(email){
    const db = await dbConnectionPool;

}
