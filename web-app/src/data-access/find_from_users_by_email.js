import { OperationalError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 */
export default function make_find_from_users_by_email({ dbConnectionPool }) {

    return find_from_users_by_email;

    async function find_from_users_by_email({ email }, omitPassword=true) {
        try {
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
                    users_tbl
                WHERE
                    email = ?
                ;
            `;
            const [rows,] = await db.execute(sqlCmd, [email]);
            if (!rows) return [];
            return (rows);
        }
        catch (error) {
            throw new OperationalError(error.message, "db__find_from_users_by_email");
        }
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
