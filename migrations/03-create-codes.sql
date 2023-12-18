CREATE TABLE IF NOT EXISTS codes_tbl (
    hashed_code CHAR(60) PRIMARY KEY,
    email VARCHAR(80) NOT NULL,
    purpose VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT chk_codes_purpose CHECK (purpose = 'signup' OR purpose = 'reset-pass'),
    INDEX idx_codes_email (email)
)
ENGINE=INNODB
;

ALTER TABLE codes_tbl MODIFY COLUMN
    expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

