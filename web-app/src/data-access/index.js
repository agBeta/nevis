import makeDbConnectionPool from "./connection.js";
import make_insert_code from "./insert_code.js";
import make_insert_user from "./insert_user.js";
import make_find_from_codes_by_email from "./find_from_codes_by_email.js";
import make_find_from_users_by_email from "./find_from_users_by_email.js";
import make_remove_codes_by_email from "./remove_codes_by_email.js";

const dbConnectionPool = makeDbConnectionPool({
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306
});

/** Query name is chosen with care. See factory function for reasoning behind this naming. */
const find_from_codes_by_email = make_find_from_codes_by_email({ dbConnectionPool });

const find_from_users_by_email = make_find_from_users_by_email({ dbConnectionPool });

const insert_code_into_db = make_insert_code({ dbConnectionPool });

const insert_user_into_db = make_insert_user({ dbConnectionPool });

const remove_codes_by_email = make_remove_codes_by_email({ dbConnectionPool });


export {
    insert_code_into_db,
    find_from_codes_by_email,
    find_from_users_by_email,
    remove_codes_by_email,
    insert_user_into_db,
};

/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 */
