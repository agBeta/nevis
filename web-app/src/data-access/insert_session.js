import { OperationalError } from "#utils/errors.js";

/** @param {{ dbConnectionPool: MySQLConnectionPool}} props */
export default function make_insert_session({ dbConnectionPool }) {

    const sqlCmd = `
        INSERT INTO sessions_tbl (
              hashed_session_id
            , user_id
            , expires_at
        )
        VALUES (? , ? , ?)
        ;
    `;

    return insert_session;

    /**
     * @param {{ hashedSessionId: string, userId: string, expiresAt: number }} param0
     * @returns {Promise<void>}
     */
    async function insert_session({ hashedSessionId, userId, expiresAt }) {
        try {
            const db = await dbConnectionPool;
            await db.execute(sqlCmd, [
                hashedSessionId,
                userId,
                new Date(expiresAt),
            ]);
        }
        catch (error) {
            throw new OperationalError(error.message, "db__insert_session");
        }
    }
}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
