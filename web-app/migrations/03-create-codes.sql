CREATE TABLE IF NOT EXISTS codes_tbl (
    -- Column data type for hashedCode is based on https://stackoverflow.com/a/5881429.
    hashedCode CHAR(60) PRIMARY KEY,
    email VARCHAR(80) NOT NULL,
    kind ENUM('signup', 'reset-password'),
    expiresAt TIMESTAMP NOT NULL
)
ENGINE=INNODB
;

