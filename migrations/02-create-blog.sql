CREATE TABLE IF NOT EXISTS blog_tbl (
    id CHAR(24) PRIMARY KEY,
    author_id CHAR(24),

    -- For pagination. created_at cannot be used for pagination. See database.md from self-documentation.
    -- Why INT instead of UNSIGNED? See [AUTO_INCREMENT limit] inside database.md.
    order_id INT NOT NULL AUTO_INCREMENT,

    blog_title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    blog_body TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    blog_topic VARCHAR(63) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    image_url VARCHAR(255) NULL,
    
    is_published TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL,
    modified_at TIMESTAMP NOT NULL,
    
    INDEX idx_blog_author_id (author_id),
    INDEX idx_blog_topic_order_id (blog_topic, order_id),
    INDEX idx_order_id (order_id),
    
    CONSTRAINT fk_blog_author_id FOREIGN KEY (author_id) 
        REFERENCES user_tbl(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) 
ENGINE=INNODB
;


ALTER TABLE blog_tbl MODIFY COLUMN
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE blog_tbl MODIFY
    modified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

