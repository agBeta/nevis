import { OperationalError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 */
export default function make_remove_codes_by_email({ dbConnectionPool }) {

    const sqlCmd = `
        DELETE FROM codes_tbl
        WHERE email = ?
        ;
    `;

    return remove_codes_by_email;

    /**
     * @param {{ email: string }} param0
     * @returns {Promise<string>} something like "Rows matched: 1  Changed: 1  Warnings: 0"
     */
    async function remove_codes_by_email({ email }) {
        try {
            const db = await dbConnectionPool;
            const [result,] = await db.execute(sqlCmd, [email]);
            return result.info;
        }
        catch (error) {
            throw new OperationalError(error.message, "db__remove_codes_by_email");
        }
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Code} Code
 */
