/** @param {{ dbConnectionPool: MySQLConnectionPool }} props */
export default function make_find_action_record_by_actionId({ dbConnectionPool }) {
    const sqlCmd = `
        SELECT
              id
            , user_id AS userId
            , purpose
            , state
            , response
            , expires_at AS expiresAt
        FROM
            action_tbl
        WHERE
            id = ?
        ;
    `;

    return find_action_record_by_actionId;

    async function find_action_record_by_actionId({ actionId }) {
        const db = await dbConnectionPool;
        const [rows, ] = await db.execute(sqlCmd, [actionId]);
        if (!rows) return [];
        return (rows);
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
