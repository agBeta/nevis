/**
 * @param {{ dbConnectionPool: MySQLConnectionPool, cacheClient: RedisClient|null }} props
 * @returns {Remove_Session}
 */
export default function make_remove_session_record_by_hashedSessionId({
    dbConnectionPool,
    cacheClient,
}) {

    const sqlCmd = `
        DELETE FROM
            session_tbl
        WHERE hashed_session_id = ?
        ;
    `;

    return remove_session_record_by_hashedSessionId;


    /**@type {Remove_Session}*/
    async function remove_session_record_by_hashedSessionId({ hashedSessionId }) {
        const db = await dbConnectionPool;
        const [result,] = await db.execute(sqlCmd, [hashedSessionId]);
        // We should also remove it from cache
        if (cacheClient) {
            await cacheClient.DEL(`session:${hashedSessionId}`);
        }
        // @ts-ignore
        return result.info;
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Remove_Session} Remove_Session
 * @typedef {import("#types").RedisClient} RedisClient
 */
