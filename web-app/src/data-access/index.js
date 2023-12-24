import makeDbConnectionPool from "./connection.js";
import makeRedisClient from "./cache-connection.js";
import make_find_from_codes_by_email from "./find_from_codes_by_email.js";
import make_find_from_sessions_by_hashedSessionId from "./find_from_sessions_by_hashedSessionId.js";
import make_find_from_users_by_email from "./find_from_users_by_email.js";
import make_insert_code from "./insert_code.js";
import make_insert_session from "./insert_session.js";
import make_insert_user from "./insert_user.js";
import make_remove_codes_by_email from "./remove_codes_by_email.js";

const dbConnectionPool = makeDbConnectionPool({
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
});

const redisClient = await /*IIFE*/(async function /* --> */ precedeWithoutCacheIfFailed(){
    try {
        const r = await makeRedisClient();
        return r;
    } catch(e) {
        return null;
    }
})();
//  Note about cache: We don't introduce other data access files to abstract cache functionality
//  (like we did for db). Reasons: First, for simplicity. Second, for being able to fine-tune
//  cache query for db query separately.

/** Query name is chosen with care. See factory function for reasoning behind this naming. */
const find_from_codes_by_email = make_find_from_codes_by_email({ dbConnectionPool });

/** @version enhanced by cache @description note the name is singular */
const find_from_sessions_by_hashedSessionId = make_find_from_sessions_by_hashedSessionId({
    dbConnectionPool,
    cacheClient: redisClient,
});

const find_from_users_by_email = make_find_from_users_by_email({ dbConnectionPool });

const insert_code = make_insert_code({ dbConnectionPool });

const insert_session = make_insert_session({ dbConnectionPool });

const insert_user = make_insert_user({ dbConnectionPool });

const remove_codes_by_email = make_remove_codes_by_email({ dbConnectionPool });


export {
    find_from_codes_by_email,
    find_from_sessions_by_hashedSessionId,
    find_from_users_by_email,
    insert_code,
    insert_session,
    insert_user,
    remove_codes_by_email,
};

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
