CREATE TABLE IF NOT EXISTS codes_tbl (
    hashedCode CHAR(60) PRIMARY KEY,
    email VARCHAR(80) NOT NULL,
    purpose ENUM('signup', 'reset-password'),
    expiresAt TIMESTAMP NOT NULL
)
ENGINE=INNODB
;

ALTER TABLE codes_tbl MODIFY COLUMN
    expiresAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

