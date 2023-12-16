import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { OperationalError } from "#utils/errors.js";

/**
 *
 * @param {{ dbConnectionPool: MySQLConnectionPool }} properties
 * @returns {Promise<UserDataAccess>}
 */
export default async function makeUserDbAccess({ dbConnectionPool }) {

    const preparedQueries = await loadPreparedSqlQueries();

    return Object.freeze({
        doInsert,
        doFindOneByEmail
    });

    /** @param {User & {getHashedPassword: () => string}} user */
    async function doInsert(user) {
        const db = await dbConnectionPool;

        await db.execute(preparedQueries.insertNewUser, {
            id: user.getId(),
            email: user.getEmail(),
            hashedPassword: user.getHashedPassword(),
            displayName: user.getDisplayName(),
            birthYear: user.getBirthYear(),
            signupAt: new Date(user.getSignupAt())
        });
    }

    /** @param {{ email: string }} criteria */
    async function doFindOneByEmail({ email }){
        const db = await
    }


    async function loadPreparedSqlQueries() {
        const dirname = new URL(".", import.meta.url).pathname;
        const directoryPath = path.resolve(dirname, "prepared-queries");

        const files = await fs.readdir(directoryPath);
        /** @todo TODO add filter based on for-which-category-comment */
        const sqlFilesOfUser = files.filter(fl => fl.startsWith("user-"));

        const /** @type {{ [key: string]: string }} */ queries = {};

        for (const fl of sqlFilesOfUser) {
            const query = readFileSync(path.resolve(directoryPath, fl), { encoding: "utf-8" });
            /** @todo TODO remove comment lines */

            const queryName = fl.replace(".sql", "").replace("user-", "");
            queries[queryName] = query;
        }
        return Object.freeze({ ...queries });
    }
}


/**
 * @typedef {import("#types").MySQLConnectionPool} MySQLConnectionPool
 * @typedef {import("#types").UserDataAccess} UserDataAccess
 * @typedef {import("#types").User} User
 */
