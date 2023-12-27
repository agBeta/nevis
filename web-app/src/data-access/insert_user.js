import { InvalidError, OperationalError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool}} props
 * @returns {Insert_User}
 */
export default function make_insert_user({ dbConnectionPool }) {

    const sqlCmd = `
        INSERT INTO user_tbl (
              id
            , email
            , hashed_password
            , display_name
            , birth_year
            , signup_at
        )
        VALUES ( ? , ? , ? ,
                 ? , ? , ? )
        ;
    `;

    return insert_user;


    /**@type {Insert_User}*/
    async function insert_user({ id, email, hashedPassword, displayName, birthYear, signupAt }) {
        try {
            const db = await dbConnectionPool;
            await db.execute(sqlCmd, [
                id,
                email,
                hashedPassword,
                displayName,
                birthYear,
                new Date(signupAt)
            ]);
        }
        catch (error) {
            if (error?.sqlMessage?.includes?.("UNQ_user_email")){
                throw new InvalidError("Email already exists.");
            }
            throw new OperationalError(error.message, "db");
        }
    }
}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Insert_User} Insert_User
 */
