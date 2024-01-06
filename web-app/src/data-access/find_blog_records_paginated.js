import { AppError } from "#utils/errors.js";

/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 * @returns {Find_Blog_Records_Paginated}
 */
export default function make_find_blog_records_paginated({ dbConnectionPool }) {
    return find_blog_records_paginated;

    /**@type {Find_Blog_Records_Paginated}*/
    async function find_blog_records_paginated({ cursor, direction, limit }) {
        const db = await dbConnectionPool;

        //  We don't use cache at the moment. But if you decided to use cache, remember, cache result of query
        //  only when direction=older.

        if (cursor === "newest") {
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
                    , U.display_name AS authorDisplayName
                    , B.blog_title  AS blogTitle
                    , B.created_at AS createdAt
                    , B.order_id  AS orderId
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
                    , U.display_name AS authorDisplayName
                    , B.blog_title  AS blogTitle
                    , B.created_at AS createdAt
                    , B.order_id  AS orderId
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
                , U.display_name AS authorDisplayName
                , B.blog_title  AS blogTitle
                , B.created_at AS createdAt
                , B.order_id  AS orderId
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
 * @typedef {import("#types").Find_Blog_Records_Paginated} Find_Blog_Records_Paginated
 */
