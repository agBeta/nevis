import { OperationalError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 */
export default function make_find_code_records_by_email({ dbConnectionPool }) {

    const sqlCmd = `
        SELECT
              hashedCode
            , email
            , purpose
            , UNIX_TIMESTAMP(expires_at) * 1000 as expiresAt
        FROM
            code_tbl
        WHERE
            email LIKE ?
        ;
    `;

    return find_code_records_by_email;

    /**
     * @param {{ email: string }} param0
     * @returns {Promise<Code[]>}
     */
    async function find_code_records_by_email({ email }) {
        try {
            const db = await dbConnectionPool;
            const [rows,] = await db.execute(sqlCmd, [email]);
            if (!rows) return [];
            return /** @type {Code[]} */ (rows);
        }
        catch (error) {
            let msg = error.message;
            if (error.sqlMessage) {
                msg = msg + error.sqlMessage;
            }
            throw new OperationalError(msg, "db__find_code_by_email");
        }
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Code} Code
 */
