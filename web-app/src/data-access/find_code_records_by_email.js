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
        const db = await dbConnectionPool;
        const [rows,] = await db.execute(sqlCmd, [email]);
        if (!rows) return [];
        return /** @type {Code[]} */ (rows);
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Code} Code
 */
