CREATE TABLE IF NOT EXISTS posts_tbl (
    id CHAR(24) PRIMARY KEY,
    authorId CHAR(24),

    postTitle VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    postBody TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,

    createdAt TIMESTAMP NOT NULL,
    modifiedAt TIMESTAMP NOT NULL,
    
    INDEX idx_author_id (authorId),
    
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