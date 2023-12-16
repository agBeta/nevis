import makeDbConnectionPool from "./connection.js";
import makeCodeDbAccess from "./codes-db.js";

const connectionPool = makeDbConnectionPool({
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
});

const codeDb = makeCodeDbAccess({ dbConnectionPool: connectionPool });

export { codeDb };

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
