import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { AppError } from "#utils/errors.js";

dotenv.config();

let /** @type {MySQLConnectionPool} */ connectionPool;


/** @return {MySQLConnectionPool} */
export default function makeDbConnectionPool() {
    //  We cannot create multiple pools in the same process, but we need access to db in our integration/e2e tests.
    //  This is why we need to return the same object if it is already created.
    if (connectionPool) {
        return connectionPool;
    }

    const dbName = process.env.MYSQL_DB_NAME;
    if (!dbName) throw new AppError("Database connection must have a valid database name.", "env-var");

    connectionPool = mysql.createPool({
        host: "localhost",
        database: dbName.concat(process.env.NODE_ENV == "test"
            ? "_test"
            : (process.env.NODE_ENV == "dev" ? "_dev" : "")
        ),
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
        connectionLimit: 4,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        // See date-and-time.md from self-documentation. This field needs so much care.
        timezone: "+03:30",
        // This field also seems important.
        charset: "utf8mb4_unicode_ci",
        dateStrings: false
    });

    /** @todo TODO connection error handling */

    return connectionPool;
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
