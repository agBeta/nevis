/** @param {{ dbConnectionPool: MySQLConnectionPool}} props */
export default function make_insert_blog({ dbConnectionPool }) {

    const sqlCmd = `
        INSERT INTO blog_tbl (
              id
            , author_id
            , blog_title
            , blog_body
            , blog_topic
            , image_url
            , is_published
            , created_at
            , modified_at
        )
        VALUES (? , ? , ? ,
                ? , ? , ? ,
                ? , ? , ? )
        ;
    `;

    return insert_blog;

    /**
     * @param {*} param0
     * @returns {Promise<void>}
     */
    async function insert_blog({ id, authorId, blogTitle, blogBody, blogTopic, imageUrl, isPublished, createdAt, modifiedAt }) {
        const db = await dbConnectionPool;
        await db.execute(sqlCmd, [
            id,
            authorId,
            blogTitle,
            blogBody,
            blogTopic,
            imageUrl ?? null,  // <-- Bind parameters must not contain undefined. To pass SQL NULL specify JS null
            isPublished,
            new Date(createdAt),
            new Date(modifiedAt),
        ]);
    }
}

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
