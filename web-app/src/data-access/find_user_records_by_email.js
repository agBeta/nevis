/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 */
export default function make_find_user_records_by_email({ dbConnectionPool }) {

    return find_user_records_by_email;

    async function find_user_records_by_email({ email }, omitPassword = true) {
        const db = await dbConnectionPool;
        const sqlCmd = `
                SELECT
                      id
                    , email
                    , display_name AS displayName
                    , birth_year AS birthYear
                    , signup_at AS signupAt
                    ${omitPassword ? "" : ", hashed_password AS hashedPassword"}
                FROM
                    user_tbl
                WHERE
                    email = ?
                ;
            `;
        const [rows,] = await db.execute(sqlCmd, [email]);
        if (!rows) return [];
        return (rows);
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
