import { AppError, InvalidError, OperationalError } from "#utils/errors.js";

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
            //  To enforce consistency, consumer of this function must specify signupAt as timestamp (i.e. number).
            //  Although TS helps us catch type-related bugs, but we add this check to be sure in runtime.
            if (typeof signupAt !== "number") {
                // Why AppError? To appear in logs. Anyway...
                throw new AppError("[signupAt] must be timestamp in milliseconds, not Date.", "db__invalid_timestamp");
            }
            //  Also timestamp must be in milliseconds (not in seconds). If the consumer incorrectly gives a timestamp
            //  in seconds, then the corresponding date of given timestamp would be something near 1970, way before
            //  2000s.
            if (signupAt < new Date("1990-01-01T00:00:00+00:00").getTime()) {
                throw new AppError("[signupAt] must be timestamp in milliseconds, not Date.", "db__invalid_timestamp");
            }

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
            if (error instanceof AppError){
                throw error; // bubble to upstream
            }
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
