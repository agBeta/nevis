/** @param {{ dbConnectionPool: MySQLConnectionPool }} props */
export default function make_find_blog_record_by_blogId ({ dbConnectionPool }) {

    const sqlCmd = `
        SELECT
            id
            , author_id  AS authorId
            , blog_title AS blogTitle
            , blog_body  AS blogBody
            , blog_topic AS blogTopic
            , image_url  AS imageUrl
            , created_at AS createdAt
            , modified_at AS modifiedAs
        FROM
            blog_tbl
        WHERE
                id = ?
            AND is_published = 1
        ;
    `;

    return find_blog_record_by_blogId;

    /**
     * @param {{ blogId: string }} param0
     * @returns {Promise<BlogRFD|null>}
     */
    async function find_blog_record_by_blogId({ blogId }) {
        const db = await dbConnectionPool;
        const [rows, ] = await db.execute(sqlCmd, [blogId]);
        if (!rows) return null;
        // @ts-ignore
        return rows[0];
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").BlogRFD} BlogRFD
 */
