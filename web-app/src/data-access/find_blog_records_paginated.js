import { AppError } from "#utils/errors.js";

/** @param {{ dbConnectionPool: MySQLConnectionPool }} props */
export default function make_find_blog_records_paginated({ dbConnectionPool }) {
    return find_blog_records_paginated;

    /**
     * @param {PaginateArgument} pageArg
     * @returns {Promise<import("#types").BlogRFDv2[]>}
     */
    async function find_blog_records_paginated({ cursor, direction, limit }) {
        const db = await dbConnectionPool;

        if (cursor === "newest") {
            if (direction !== "newer") {
                throw new AppError(
                    `Invalid parameters. direction=${direction} doesn't make sense with cursor=${cursor}.`,
                    "db__invalid_paginate"
                );
            }
            const sqlCmd = `
                SELECT
                    B.id AS id
                    , B.author_id AS authorId
                    , U.displayName AS authorDisplayName
                    , B.blog_title  AS blogTitle
                    , B.create_at AS createdAs
                    , B.order_id  AS order_id
                FROM
                    blog_tbl AS B
                INNER JOIN
                    user_tbl AS U
                    ON
                        B.author_id = U.id
                ORDER BY
                    B.order_id DESC
                LIMIT ${limit}
            `;
            const [rows,] = await db.execute(sqlCmd, []);
            if (!rows) return [];
            // @ts-ignore
            return (rows);
        }


        if (cursor === "oldest") {
            if (direction !== "older") {
                throw new AppError(
                    `Invalid parameters. direction=${direction} doesn't make sense with cursor=${cursor}.`,
                    "db__invalid_paginate"
                );
            }
            const sqlCmd = `
                SELECT
                    B.id AS id
                    , B.author_id AS authorId
                    , U.displayName AS authorDisplayName
                    , B.blog_title  AS blogTitle
                    , B.create_at AS createdAs
                    , B.order_id  AS order_id
                FROM
                    blog_tbl AS B
                INNER JOIN
                    user_tbl AS U
                    ON
                        B.author_id = U.id
                ORDER BY
                    B.order_id ASC
                LIMIT ${limit}
            `;
            const [rows,] = await db.execute(sqlCmd, []);
            if (!rows) return [];
            // @ts-ignore
            return (rows);
        }


        const sqlCmd = `
            SELECT
                B.id AS id
                , B.author_id AS authorId
                , U.displayName AS authorDisplayName
                , B.blog_title  AS blogTitle
                , B.create_at AS createdAs
                , B.order_id  AS order_id
            FROM
                blog_tbl AS B
            INNER JOIN
                user_tbl AS U
                ON
                    B.author_id = U.id
            WHERE
                ${direction === "newer" ? "B.order_id > ?" : "B.order_id < ?"}
            ORDER BY
                B.order_id ASC
            LIMIT ${limit}
        `;
        const [rows,] = await db.execute(sqlCmd, [cursor]);
        if (!rows) return [];
        // @ts-ignore
        return (rows);
    }


}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").PaginateArgument} PaginateArgument
 */