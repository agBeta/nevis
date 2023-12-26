/**
 * @param {{ dbConnectionPool: MySQLConnectionPool}} props
 * @returns {Insert_Session}
 */
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

    /** @type {Insert_Session} */
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
 * @typedef {import("#types").Insert_Session} Insert_Session
 */
