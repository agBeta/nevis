import makeDbConnectionPool from "./connection.js";
import makeCodeDbAccess from "./code-db.js";
import makeUserDbAccess from "./user-db.js";

const connectionPool = makeDbConnectionPool({
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
});

const codeDb = makeCodeDbAccess({ dbConnectionPool: connectionPool });
const userDb = await makeUserDbAccess({ dbConnectionPool: connectionPool });

export { codeDb, userDb };

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
