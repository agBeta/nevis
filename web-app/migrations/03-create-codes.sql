CREATE TABLE IF NOT EXISTS codes_tbl (
    hashedCode CHAR(60) PRIMARY KEY,
    email VARCHAR(80) NOT NULL,
    purpose VARCHAR(20) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    CONSTRAINT chk_codes_purpose CHECK (purpose = 'signup' OR purpose = 'reset-pass'),
    INDEX idx_codes_email (email)
)
ENGINE=INNODB
;

ALTER TABLE codes_tbl MODIFY COLUMN
    expiresAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

