/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 * @return {Find_Action_Record_By_ActionId}
 */
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

    /** @type {Find_Action_Record_By_ActionId} */
    async function find_action_record_by_actionId({ actionId }) {
        const db = await dbConnectionPool;
        const [rows, ] = await db.execute(sqlCmd, [actionId]);
        if (!rows) return null;
        // @ts-ignore
        return { ...rows[0], expiresAt: new Date(rows[0].expiresAt).getTime() } ;
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").Find_Action_Record_By_ActionId} Find_Action_Record_By_ActionId
 */
