import { OperationalError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool}} props
 */
export default function make_insert_code({ dbConnectionPool }) {

    const sqlCmd = `
        INSERT INTO code_tbl (
              email
            , hashed_code
            , purpose
            , expires_at
        )
        VALUES (? , ? , ? , ?)
        ;
    `;

    return insert_code;

    /**
     * @param {Code} param0
     * @returns {Promise<void>}
     */
    async function insert_code({ email, hashedCode, purpose, expiresAt }) {
        const db = await dbConnectionPool;
        await db.execute(sqlCmd, [
            email,
            hashedCode,
            purpose,
            new Date(expiresAt)
        ]);
    }
}

/**
 * @typedef {import("#types").Code} Code
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
