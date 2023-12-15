import makeDbConnectionPool from "./connection.js";
import makeCodeDbAccess from "./codes-db.js";

const connectionPool = makeDbConnectionPool();

const codeDb = makeCodeDbAccess({ dbConnectionPool: connectionPool });

export { codeDb };

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
