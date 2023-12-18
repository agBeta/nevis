CREATE TABLE IF NOT EXISTS posts_tbl (
    id CHAR(24) PRIMARY KEY,
    author_id CHAR(24),

    -- For pagination. created_at cannot be used for pagination. See database.md from self-documentation.
    order_id INT NOT NULL AUTO_INCREMENT,

    post_title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    post_body TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    post_topic VARCHAR(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    
    is_published TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    modified_at TIMESTAMP NOT NULL,
    
    INDEX idx_posts_author_id (author_id),
    INDEX idx_posts_topic_order_id (post_topic, order_id),
    INDEX idx_order_id (order_id),
    
    CONSTRAINT fk_posts_author_id FOREIGN KEY (author_id) 
        REFERENCES users_tbl(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) 
ENGINE=INNODB
;


ALTER TABLE posts_tbl MODIFY COLUMN
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE posts_tbl MODIFY
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

