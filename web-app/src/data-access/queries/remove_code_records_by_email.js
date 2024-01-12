/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 */
export default function make_remove_code_record_by_email({ dbConnectionPool }) {

    const sqlCmd = `
        DELETE FROM code_tbl
        WHERE email = ?
        ;
    `;

    return remove_code_record_by_email;

    /**
     * @param {{ email: string }} param0
     * @returns {Promise<string>} something like "Rows matched: 1  Changed: 1  Warnings: 0"
     */
    async function remove_code_record_by_email({ email }) {
        const db = await dbConnectionPool;
        const [result,] = await db.execute(sqlCmd, [email]);
        // @ts-ignore
        return result.info;
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Code} Code
 */
