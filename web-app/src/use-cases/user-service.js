import { AppError } from "#utils/errors.js";
import { makeUser } from "../entities/index.js";

/**
 * @param {{ userDb: UserDataAccess }} injections
 * @returns
 */
export default function makeUserService({ userDb }) {

    return Object.freeze({
        addUser
    });

    /**
     * Add user to the db
     * @param {UserRawInformation} userRawInfo
     * @throws If email is already taken
     * @throws If user raw info is invalid.
     */
    async function addUser(userRawInfo) {
        const user = makeUser(userRawInfo);
        const existing = await userDb.doFindOneByEmail({ email: user.getEmail() });
        if (existing) {
            throw new AppError("Email already exists", "email-exists");
        }
        await userDb.doInsert(user);
    }
}


/**
 * @typedef {import("#types").User} User
 * @typedef {import("#types").UserRawInformation} UserRawInformation
 * @typedef {import("#types").UserDataAccess} UserDataAccess
 */
