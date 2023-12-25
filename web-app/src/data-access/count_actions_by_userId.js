/** @param {{ dbConnectionPool: MySQLConnectionPool }} props */
export default function make_count_actions_by_userId({ dbConnectionPool }){
    return count_actions_by_userId;

    /**
     * @param {*} param0
     */
    async function count_actions_by_userId({ userId, purpose }) {
        const db = await dbConnectionPool;
        const [result, ] = await db.execute(
            `   SELECT
                    COUNT(*) AS actionsCount
                FROM
                    action_tbl
                WHERE
                    user_id = ?
                ${purpose ? "AND purpose = ? " : ""}
                ;
            `,
            purpose ? [userId, purpose] : [userId]
        );
        // @ts-ignore
        return result[0].actionsCount;
    }
}



/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */

