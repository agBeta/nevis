import makeDbConnectionPool from "./connection.js";
import makeRedisClient from "./cache-connection.js";
import make_find_code_records_by_email from "./find_code_records_by_email.js";
import make_find_session_record_by_hashedSessionId from "./find_session_record_by_hashedSessionId.js";
import make_find_user_records_by_email from "./find_user_records_by_email.js";
import make_insert_code from "./insert_code.js";
import make_insert_session from "./insert_session.js";
import make_insert_user from "./insert_user.js";
import make_remove_code_records_by_email from "./remove_code_records_by_email.js";
import make_count_actions_by_userId from "./count_actions_by_userId.js";
import make_insert_action from "./insert_action.js";
import make_find_action_record_by_actionId from "./find_action_record_by_actionId.js";
import make_find_blog_record_by_blogId from "./find_blog_record_by_blogId.js";
import make_find_blog_records_paginated from "./find_blog_records_paginated.js";
import make_insert_blog from "./insert_blog.js";
import make_update_action from "./update_action.js";
import make_remove_session_record_by_hashedSessionId from "./remove_session_record_by_hashedSessionId.js";

const dbConnectionPool = makeDbConnectionPool({
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
});

const redisClient = await /*IIFE*/(async function /* --> */ precedeWithoutCacheIfFailed() {
    try {
        const r = await makeRedisClient();
        return r;
    } catch (e) {
        if (process.env.REDIS_CONNECTION_FAIL_SILENTLY === "no") {
            throw new Error("🔥 The application should not continue without a cache.");
        }
        return null;
    }
})();
//  Note about cache: We don't introduce other data access files to abstract cache functionality
//  (like we did for db). Reasons: First, for simplicity. Second, for being able to fine-tune
//  cache query for db query separately.

/** Query name is chosen with care. See factory function for reasoning behind this naming. */
const find_code_records_by_email = make_find_code_records_by_email({ dbConnectionPool });

/** @version enhanced by cache @description note the name is singular */
const find_session_record_by_hashedSessionId = make_find_session_record_by_hashedSessionId({
    dbConnectionPool,
    cacheClient: redisClient,
});

const find_user_records_by_email = make_find_user_records_by_email({ dbConnectionPool });

const insert_blog = make_insert_blog({ dbConnectionPool });

const insert_code = make_insert_code({ dbConnectionPool });

const insert_session = make_insert_session({ dbConnectionPool });

const insert_user = make_insert_user({ dbConnectionPool });

const remove_code_records_by_email = make_remove_code_records_by_email({ dbConnectionPool });

//  [actions] are important. We cannot solely rely on cache. Why would you introduce actions if you don't back it up
//  with a proper storage? So use database.
const count_actions_by_userId = make_count_actions_by_userId({ dbConnectionPool });
const insert_action = make_insert_action({ dbConnectionPool });
const find_action_record_by_actionId = make_find_action_record_by_actionId({ dbConnectionPool });
const update_action = make_update_action({ dbConnectionPool });


/** @description returns null if the blog isn't published. */
const find_blog_record_by_blogId = make_find_blog_record_by_blogId({ dbConnectionPool });

const find_blog_records_paginated = make_find_blog_records_paginated({ dbConnectionPool });

const remove_session_record_by_hashedSessionId = make_remove_session_record_by_hashedSessionId({
    dbConnectionPool,
    cacheClient: redisClient,
});

export {
    count_actions_by_userId,
    find_action_record_by_actionId,
    find_blog_record_by_blogId,
    find_blog_records_paginated,
    find_code_records_by_email,
    find_session_record_by_hashedSessionId,
    find_user_records_by_email,
    insert_action,
    insert_blog,
    insert_code,
    insert_session,
    insert_user,
    remove_code_records_by_email,
    remove_session_record_by_hashedSessionId,
    update_action,
};

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
