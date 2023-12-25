CREATE TABLE action_tbl (
    id CHAR(32) PRIMARY KEY,
    user_id CHAR(24) NOT NULL,
    purpose VARCHAR(31) NOT NULL
    state SMALLINT NOT NULL,
    expires_at TIMESTAMP NOT NULL,

    -- stringified response
    response VARCHAR(2047) NULL,

    INDEX idx_action_user_id (user_id),

    CONSTRAINT fk_action_user_id FOREIGN KEY (user_id)
        REFERENCES user_tbl(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
)
ENGINE=InnoDB
;

ALTER TABLE action_tbl MODIFY 
    expires_at TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL 12 HOUR);