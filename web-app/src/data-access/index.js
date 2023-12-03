import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { AppError } from "#utils/errors.js";
import makeCodeDbAccess from "./codes-db.js/index.js";
dotenv.config();

const dbName = process.env.MYSQL_DB_NAME;
if (!dbName) throw new AppError("Database connection must have a valid database name.");

const connectionPool = mysql.createPool({
    host: "localhost",
    database: dbName.concat(process.env.NODE_ENV == "test"
        ? "_test"
        : (process.env.NODE_ENV == "dev" ? "_dev" : "")
    ),
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    connectionLimit: 3,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    // See date-and-time.md from self-documentation. This field needs so much care.
    timezone: "+03:30",
    // This field also seems important.
    charset: "utf8mb4_unicode_ci"
    // We could declare our own typeCast for dates.
});

const codeDb = makeCodeDbAccess({ dbConnectionPool: connectionPool });

export { codeDb };

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
