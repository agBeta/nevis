CREATE TABLE IF NOT EXISTS auth_sessions_tbl (
    sessionId CHAR(48) NOT NULL,
    userId CHAR(24),
    expiresAt TIMESTAMP NOT NULL,

    PRIMARY KEY (sessionId),
    
    CONSTRAINT fk_auth_sessions_userId FOREIGN KEY (userId) 
        REFERENCES users_tbl(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE=INNODB
;

ALTER TABLE auth_sessions_tbl CHANGE expiresAt
    expiresAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
