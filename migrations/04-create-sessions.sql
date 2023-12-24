CREATE TABLE IF NOT EXISTS auth_session_tbl (
    hashed_session_id CHAR(24) NOT NULL,
    user_id CHAR(24),
    expires_at TIMESTAMP NOT NULL,

    PRIMARY KEY (session_id),
    
    CONSTRAINT fk_auth_session_user_id FOREIGN KEY (user_id) 
        REFERENCES users_tbl(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
)
ENGINE=INNODB
;

ALTER TABLE auth_session_tbl CHANGE expires_at
    expires_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
