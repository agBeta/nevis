/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 * @returns {Find_Code_Records_By_Email}
 */
export default function make_find_code_records_by_email({ dbConnectionPool }) {

    const sqlCmd = `
        SELECT
              hashed_code AS hashedCode
            , email
            , purpose
            , UNIX_TIMESTAMP(expires_at) * 1000 as expiresAt
        FROM
            code_tbl
        WHERE
            email = ?
        ;
    `;

    return find_code_records_by_email;

    /**@type {Find_Code_Records_By_Email}*/
    async function find_code_records_by_email({ email }) {
        const db = await dbConnectionPool;
        const [rows,] = await db.execute(sqlCmd, [email]);
        if (!rows) return [];
        // @ts-ignore
        return (rows);
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Find_Code_Records_By_Email} Find_Code_Records_By_Email
 */
