import log from "#utils/log.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool, cacheClient: RedisClient|null }} props
 * @returns {Find_Session_Record_By_HashedSessionId}
 */
export default function make_find_session_record_by_hashedSessionId({ dbConnectionPool, cacheClient }) {
    const sqlCmd = `
        SELECT
              hashed_session_id AS hashedSessionId
            , user_id AS userId
            , UNIX_TIMESTAMP(expires_at) * 1000 AS expiresAt
        FROM session_tbl
        WHERE hashed_session_id = ?
        ;
    `;

    return find_session_record_by_hashedSessionId;

    /**@type {Find_Session_Record_By_HashedSessionId}*/
    async function find_session_record_by_hashedSessionId({ hashedSessionId }) {
        let /**@type {Session|null}*/ resultFromCache = /*to suppress ts warning*/null;
        try {
            resultFromCache = await ask_cache(hashedSessionId);
        }
        catch (err) {
            log({
                level: "error",
                keyword: "cache__session",
                message: `Failed to RETRIEVE session ${hashedSessionId} from cache. ` + err.message
            });
            // We don't propagate cache errors to upstream.
        }
        if (resultFromCache) {
            if (resultFromCache.expiresAt < Date.now())
                return resultFromCache;
            else {
                delete_from_cache(hashedSessionId)
                    .catch((err) => {
                        log({
                            level: "error",
                            keyword: "cache__session",
                            message: `Failed to DELETE session ${resultFromCache?.hashedSessionId} from cache. ` + err.message
                        });
                        // We don't propagate cache errors to upstream.
                    });
            }
        }
        const resultFromDb = await ask_db(hashedSessionId);
        if (resultFromDb != null) {
            put_inside_cache(resultFromDb).catch((err) => {
                log({
                    level: "error",
                    keyword: "cache__session",
                    message: `Failed to SET session ${hashedSessionId} inside cache. ` + err.message
                });
                // We don't propagate cache errors to upstream.
            });
        }
        return resultFromDb;
    }

    // ---------- helper functions implementation ---------

    /** @returns {Promise<Session|null>} */
    async function ask_db(/**@type {string}*/ hashedSessionId) {
        const db = await dbConnectionPool;
        const [rows,] = await db.execute(sqlCmd, [hashedSessionId]);
        if (!rows) return null;
        // @ts-ignore
        const result = rows[0];
        // Note, expiresAt from MySQL database isn't timestamp (i.e. number) but we are using UNIX_TIMESTAMP in query.
        return result;
    }

    /** @returns {Promise<Session|null>} */
    async function ask_cache(/**@type {string}*/ hashedSessionId) {
        if (!cacheClient) {
            return null;
        }
        const stringified = await cacheClient.GET(`session:${hashedSessionId}`);
        if (!stringified) return null;
        const s = JSON.parse(stringified);
        return s;
    }

    /**
     * We don't use TTL or EXPIRE from redis, since sessions are quite long-lived. Also
     * we aren't sure about impact of TTL on performance.
     * @param {Session} param0
     */
    async function put_inside_cache({ hashedSessionId, userId, expiresAt }) {
        if (!cacheClient) return;
        const value = JSON.stringify({ hashedSessionId, userId, expiresAt });
        await cacheClient.SET(`session:${hashedSessionId}`, value);
    }

    async function delete_from_cache(/**@type {string}*/ hashedSessionId) {
        if (!cacheClient) return;
        await cacheClient.DEL(`session:${hashedSessionId}`);
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").RedisClient} RedisClient
 * @typedef {import("#types").Find_Session_Record_By_HashedSessionId} Find_Session_Record_By_HashedSessionId
 * @typedef {import("#types").Session} Session
 */
