/** @param {{ dbConnectionPool: MySQLConnectionPool}} props */
export default function make_update_action({ dbConnectionPool }) {

    const sqlCmd = `
        UPDATE
            action_tbl
        SET
              state = ?
            , response = ?
        WHERE
            id = ?
        ;
    `;

    return update_action;

    /**
     * @param {*} param0
     * @returns {Promise<void>}
     */
    async function update_action({ id, state, response }) {
        const db = await dbConnectionPool;
        await db.execute(sqlCmd, [
            state,
            response ?? null,
            id,
        ]);
    }
}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
