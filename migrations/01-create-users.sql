CREATE TABLE IF NOT EXISTS users_tbl (
    id CHAR(24) PRIMARY KEY,
    email VARCHAR(80) NOT NULL,
    -- Column data type for hashedCode is based on https://stackoverflow.com/a/5881429.
    hashed_password CHAR(60),
    -- NAME is a reserved word in MySQL. Also see "backticks vs brackets" in database.md self-documentation.
    display_name VARCHAR(80) NOT NULL,
    -- Don't use YEAR(4). See database.md from self-documentation.
    birth_year SMALLINT NULL,
    signup_at TIMESTAMP NOT NULL,

    CONSTRAINT UNQ_user_email UNIQUE(email)
) 
ENGINE=INNODB
;

-- See timestamp auto-update in database.md from self-documentation.
ALTER TABLE users_tbl MODIFY 
    signup_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users_tbl MODIFY
    display_name VARCHAR(80)
        CHARACTER SET utf8mb4 
        COLLATE utf8mb4_unicode_ci;


-- Why? See comment at the end.
ALTER TABLE users_tbl MODIFY
    email VARCHAR(80)
        CHARACTER SET utf8mb4 
        COLLATE utf8mb4_0900_as_cs;


--  It isn't safe to use case-insensitive collation for email. First, checkout `Matthew James Briggs`'s comment in 
--  https://stackoverflow.com/a/9808332. Also about email address containing non-english characters, see 
--  https://stackoverflow.com/q/760150 and https://mailoji.com/.
--  Finally according to https://stackoverflow.com/q/463764, indexes defined as UNIQUE can be case sensitive or insensitive 
--  based on the collation of the field.