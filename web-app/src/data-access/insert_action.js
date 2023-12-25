/**
 * @param {{ dbConnectionPool: MySQLConnectionPool}} props
 */
export default function make_insert_action({ dbConnectionPool }) {

    const sqlCmd = `
        INSERT INTO action_tbl (
              id
            , user_id
            , purpose
            , state
            , response
            , expires_at
        )
        VALUES (? , ? , ? ,
                ? , ? , ? )
        ;
    `;

    return insert_action;

    /**
     * @param {*} param0
     * @returns {Promise<void>}
     */
    async function insert_action({ actionId, purpose, userId, state, response, ttlInSeconds }) {
        const db = await dbConnectionPool;
        await db.execute(sqlCmd, [
            actionId,
            userId,
            purpose,
            state,
            response != null ? JSON.stringify(response) : null,
            new Date(Date.now() + ttlInSeconds * 1000)
        ]);
    }
}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
