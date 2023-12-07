CREATE TABLE IF NOT EXISTS posts_tbl (
    id CHAR(24) PRIMARY KEY,
    authorId CHAR(24),

    -- For pagination. createdAt cannot be used for pagination. See database.md from self-documentation.
    orderId INT NOT NULL AUTO_INCREMENT,

    postTitle VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    postBody TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    topic VARCHAR(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    
    isPublished TINYINT(1) NOT NULL DEFAULT 0,
    createdAt TIMESTAMP NOT NULL,
    modifiedAt TIMESTAMP NOT NULL,
    
    INDEX idx_posts_authorId (authorId),
    INDEX idx_posts_topic_orderId (topic, orderId),
    INDEX idx_orderId (orderId),
    
    CONSTRAINT fk_posts_authorId FOREIGN KEY (authorId) 
        REFERENCES users_tbl(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) 
ENGINE=INNODB
;


ALTER TABLE posts_tbl MODIFY COLUMN
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE posts_tbl MODIFY
    modifiedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

