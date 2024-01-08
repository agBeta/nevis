import * as DbHelper from "./seed.js";
import make_find_user_records_by_email from "#da/find_user_records_by_email.js";

/**
 * @param {{ seed?: { numberOfUsers?: number, numberOfBlogs?: number } }} param0
 * @returns {Promise<{
 *      find_user_records_by_email: import("#types").Find_User_Records_By_Email,
 *      closeDbConnections: () => Promise<void>,
 * }>}
 */
export async function initializeEverything({ seed }) {
    if (seed != null) {
        await DbHelper.clearAll();
        const userIds = await DbHelper.seedUsers(seed.numberOfUsers ?? 10);
        await DbHelper.seedBlogs(userIds, seed.numberOfBlogs ?? 50);
    }
    const dbConnectionPool = DbHelper.dbConnectionPool;
    const find_user_records_by_email = make_find_user_records_by_email({ dbConnectionPool });

    return {
        find_user_records_by_email,
        closeDbConnections: function() {
            return dbConnectionPool.end();
        }
    };
}
