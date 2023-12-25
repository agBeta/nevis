DELIMITER $$

CREATE EVENT e_delete_expired_codes
    ON SCHEDULE 
        EVERY 1 MINUTE
    ENABLE
    COMMENT 'Removes codes that are expired and can no longer be used to signup or reset password'
    DO
        BEGIN
            DELETE FROM `code_tbl`
            WHERE `expires_at` < CURRENT_TIMESTAMP();
        END$$

DELIMITER ;

-- -----------------------------------

DELIMITER $$

CREATE EVENT e_delete_expired_actions
    ON SCHEDULE 
        EVERY 1 MINUTE
    ENABLE
    COMMENT 'Removes actions that are expired'
    DO
        BEGIN
            DELETE FROM `action_tbl`
            WHERE `expires_at` < CURRENT_TIMESTAMP();
        END$$

DELIMITER ;

--  You may checkout ALTER EVENT from docs (https://dev.mysql.com/doc/refman/8.0/en/alter-event.html).