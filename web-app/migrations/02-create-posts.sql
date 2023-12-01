CREATE TABLE IF NOT EXISTS posts_tbl (
    id CHAR(24) PRIMARY KEY,
    authorId CHAR(24),
    -- SOURCE is a reserved keyword in MySQL.
    authorSource JSON NOT NULL,

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

-- based on https://dev.mysql.com/doc/refman/8.0/en/json-validation-functions.html.
ALTER TABLE posts_tbl
    ADD CONSTRAINT chk_posts_valid_json_authorSource 
        CHECK(
            JSON_SCHEMA_VALID(
                '{
                    "type":"object",
                    "properties":{
                        "ip":{"type":"string"},
                        "userAgent":{"type":"string"},
                        "referer":{"type":"string"}
                    },
                    "required": ["ip"]
                }', 
                authorSource
            )
        );
