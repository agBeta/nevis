import { OperationalError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 */
export default function make_find_from_codes_by_email({ dbConnectionPool }) {
    //  This name above (which has an extra "_from_") is better than find_codes_by_email. Why? Because the later
    //  implies as if we are only retrieving code (actually hashed_code) column from db, but in reality we are
    //  retrieving all columns (of matched rows).

    const sqlCmd = `
        SELECT
              hashedCode
            , email
            , purpose
            , UNIX_TIMESTAMP(expires_at) * 1000 as expiresAt
        FROM
            codes_tbl
        WHERE
            email LIKE ?
        ;
    `;

    return find_from_codes_by_email;

    /**
     * @param {{ email: string }} param0
     * @returns {Promise<Code[]>}
     */
    async function find_from_codes_by_email({ email }) {
        try {
            const db = await dbConnectionPool;
            const [rows,] = await db.execute(sqlCmd, [email]);
            if (!rows) return [];
            return /** @type {Code[]} */ (rows);
        }
        catch (error) {
            throw new OperationalError(error.message, "db__find_from_codes_by_email");
        }
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Code} Code
 */
