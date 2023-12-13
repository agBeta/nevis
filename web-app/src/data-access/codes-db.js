import bcrypt from "bcrypt";
import { InvalidError, OperationalError } from "#utils/errors.js";

/**
 *
 * @param {{ dbConnectionPool: MySQLConnectionPool }} properties
 * @returns {CodeDataAccess}
 */
export default function makeCodeDbAccess({ dbConnectionPool }) {

    //  We don't use setInterval. We already have EVENT in our MySQL Server. Moreover it makes testing a bit difficult.
    //  setInterval(removeExpiredCodes, 60 * 1000);
    //  You may also read test.md in self-documentation.

    return Object.freeze({
        doFindAll,
        doInsert
    });

    /**
     * @param { { email?: string } } criteria
     */
    async function doFindAll({ email } = {}) {
        const db = await dbConnectionPool;
        const sqlCmd = "SELECT * FROM codes_tbl WHERE email = ? ;";
        const [rows,] = await db.execute(sqlCmd, [email]);
        if (!rows) return [];
        return /** @type {any[]} */(rows);
    }

    /**
     * @param { { email?: string, code?: string } } properties
     */
    async function doInsert({ email, code }) {
        if (!email) throw new InvalidError("email must be valid.");
        if (!code) throw new InvalidError("code must be valid.");
        const db = await dbConnectionPool;

        const expiresAt = new Date();
        // The code will expire 10 minutes later.
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        try {
            //  According to https://stackoverflow.com/a/20296312, using MySQL encrypt() is not recommended, since
            //  any data we pass to a MySQL query may end up in server log files.
            const hashedCode = await bcrypt.hash(code, 8);
            const sqlCmd = "INSERT INTO codes_tbl (email, hashedCode, expiresAt) VALUES (?, ?, ?) ;";
            await db.execute(sqlCmd, [email, hashedCode, expiresAt]);
        }
        catch (error) {
            throw new OperationalError("Could not insert new code into database. " + error.message, "code-db");
        }
    }

}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").CodeDataAccess} CodeDataAccess
 */
