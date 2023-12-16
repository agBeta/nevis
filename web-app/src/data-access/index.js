import makeDbConnectionPool from "./connection.js";
import makeCodeDbAccess from "./codes-db.js";

const connectionPool = makeDbConnectionPool({
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
    /**
     * Side Note:
     * If multiple (test) processes want to run concurrently or in parallel on the same machine, each process will
     * probably have different value for "MYSQL_PORT" environment variable. At the moment, we aren't doing this but
     * be aware.
    */
});

const codeDb = makeCodeDbAccess({ dbConnectionPool: connectionPool });

export { codeDb };

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
