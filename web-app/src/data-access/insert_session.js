import { OperationalError } from "#utils/errors.js";

/** @param {{ dbConnectionPool: MySQLConnectionPool}} props */
export default function make_insert_session({ dbConnectionPool }) {

    const sqlCmd = `
        INSERT INTO session_tbl (
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
        const db = await dbConnectionPool;
        await db.execute(sqlCmd, [
            hashedSessionId,
            userId,
            new Date(expiresAt),
        ]);
    }
}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
