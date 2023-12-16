
/**
 * @param {MySQLConnectionPool} dbConnectionPool
 * @param {"codes" | "auth_sessions" | "users" | "posts" | "all"} [table="all"]
 */
export async function doClear(dbConnectionPool, table = "all") {
    const db = await dbConnectionPool;

    switch (table) {
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


export function addTestToCurrentlyUsing(testName) {

}

/**
 * @param {MySQLConnectionPool} dbConnectionPool
 */
export function doCloseConnections(dbConnectionPool) {
    // Based on https://github.com/mysqljs/mysql/blob/master/Readme.md#terminating-connections.
    dbConnectionPool.end();
}


/**
 * Returns all records whose email equals the given email
 * @param {MySQLConnectionPool} dbConnectionPool
 * @param {string} email
 * @returns {Promise<any[]>}
 */
export async function doFindAllInCodesDb(dbConnectionPool, email) {
    const db = await dbConnectionPool;
    const [rows,] = await db.execute("SELECT * from codes_tbl WHERE email LIKE ? ;", [email]);
    if (!rows) return [];
    return /** @type {any[]} */ (rows);
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
