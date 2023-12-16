import mysql from "mysql2/promise";
import { AppError } from "#utils/errors.js";

let /** @type {MySQLConnectionPool} */ connectionPool;
let /** @type {number|undefined} */ portOfAlreadyEstablishedPool;


/**
 * @param {Object} props
 * @param {number} props.port
 * @return {MySQLConnectionPool}
 */
export default function makeDbConnectionPool({ port }) {
    //  We cannot create multiple pools in the same process, but we need access to db in our integration/e2e tests.
    //  This is why we need to return the same object if it is already created.
    //  Though, we need to pass port as an argument, so that (in theory) if multiple (test) processes try to connect to
    //  our (test) database `concurrently` or `in parallel`, we could be able to assign different port for each process.
    if (connectionPool && portOfAlreadyEstablishedPool === port) {
        return connectionPool;
    }
    else if (connectionPool) {
        //  So we have a connectionPool but not on the desired port. By design, It can only happen if some test files
        //  run serially in the same single process but set different values for MYSQL_PORT in their environment config.
        //  By our design, it isn't possible. See tests/configs folder.
        throw new Error("You are doing something terribly wrong!");
    }

    //  Environment variables must already be loaded, either in application entry point (main.js in production) or
    //  in any test file that is indirectly/directly importing this function.
    const dbName = process.env.MYSQL_DB_NAME;
    if (!dbName) throw new AppError("Database connection must have a valid database name.", "env-var");

    connectionPool = mysql.createPool({
        host: "localhost",
        database: dbName.concat(process.env.NODE_ENV == "test" ? "_test" : ""),
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: port,
        connectionLimit: 4,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        // See date-and-time.md from self-documentation. This field needs so much care.
        timezone: "+03:30",
        // This field also seems important.
        charset: "utf8mb4_unicode_ci",
        dateStrings: false
    });

    portOfAlreadyEstablishedPool = port;

    /** @todo TODO connection error handling */

    return connectionPool;
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
