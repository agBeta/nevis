//  We won't use any of data-access exported functions in our tests. Tests need different queries that some of them
//  aren't implemented in data-access. Also it would be a very bad idea to couple tests to data-access implementation.

/**
 * @param {MySQLConnectionPool} dbConnectionPool
 * @param {"code" | "session" | "user" | "blog" | "all"} [table="all"]
 */
export async function doClear(dbConnectionPool, table = "all") {
    const db = await dbConnectionPool;

    switch (table) {
        case "all":
            //  Although deleting users will be enough, since every other table has a foreign key to users_tbl. But who
            //  tests the test? Let's keep it simple and do all.
            await db.execute("DELETE from session_tbl;", []);
            await db.execute("DELETE from code_tbl;", []);
            await db.execute("DELETE from blog_tbl;", []);
            await db.execute("DELETE from user_tbl;", []);
            await db.execute("ALTER TABLE blog_tbl AUTO_INCREMENT = 1;");
            break;

        case "code":
            await db.execute("DELETE from code_tbl;", []);
            break;
        case "user":
            await db.execute("DELETE from user_tbl;", []);
            break;
        case "blog":
            await db.execute("DELETE from blog_tbl;", []);
            await db.execute("ALTER TABLE blog_tbl AUTO_INCREMENT = 1;");
            break;
        case "session":
            await db.execute("DELETE from session_tbl;", []);
            break;
    }
}

/**
 * This function is closely associated with the fact that each test runs on its own database, hence different database
 * name and difference connection pool. If some tests would be running via the same connection pool (even if they don't
 * encounter polluted data by other tests or race conditions), as soon as one of them finished, the pool will be closed.
 * Anyway, be ware of these situations.
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
    const [rows,] = await db.execute(`
            SELECT
                hashed_code AS hashedCode
              , email
              , purpose
              , UNIX_TIMESTAMP(expires_at) * 1000 AS expiresAt
            FROM
                code_tbl
            WHERE
                email = ?
            ;
        `,
    [email]);
    if (!rows) return [];
    return /** @type {any[]} */ (rows);
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
