/**
 * @param {{ dbConnectionPool: MySQLConnectionPool }} props
 * @return {Find_Blog_Record_By_BlogId}
 */
export default function make_find_blog_record_by_blogId ({ dbConnectionPool }) {

    const sqlCmd = `
        SELECT
            id
            , author_id  AS authorId
            , blog_title AS blogTitle
            , blog_body  AS blogBody
            , blog_topic AS blogTopic
            , image_url  AS imageUrl
            , UNIX_TIMESTAMP(created_at) * 1000 AS createdAt
            , UNIX_TIMESTAMP(modified_at) * 1000 AS modifiedAt
        FROM
            blog_tbl
        WHERE
                id = ?
            AND is_published = 1
        ;
    `;

    return find_blog_record_by_blogId;

    /** @type {Find_Blog_Record_By_BlogId} */
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
 * @typedef {import("#types").Find_Blog_Record_By_BlogId} Find_Blog_Record_By_BlogId
 */
