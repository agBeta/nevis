import { InvalidError } from "#utils/errors.js";

/**
 * @param {{
 *      Id: import("#types").IdFacility,
 *      isPasswordStrong: (plainPassword: string) => boolean
 * }} injections
 * @returns {import("#types").UserFactory}
 */
export default function buildMakeUser({ Id, isPasswordStrong }) {

    return makeUser;

    /**
     * @param {import("#types").UserRawInformation} info
     * @returns {import("#types").User}
     */
    function makeUser({
        id = Id.createId(),
        email,
        displayName,
        birthYear,
        signupAt = Date.now(),
        lastLoginAt = Date.now(),
        password
    }) {

        // Early sign of putting application in invalid state helps us debug easier, before invalid object contaminates the rest.
        if (!Id.isValidId(id)) {
            throw new InvalidError("User must have a valid id.");
        }
        if (!displayName) {
            throw new InvalidError("User must have a displayName.");
        }
        if (displayName.length < 3) {
            throw new InvalidError("User displayName must be longer than 2 characters.");
        }
        if (displayName.length > 80) {
            throw new InvalidError("User displayName must be smaller than 80 characters.");
        }
        if (!email) {
            throw new InvalidError("User must have an email");
        }
        if (!email.includes("@") || !email.includes(".")) {
            throw new InvalidError("User email must be valid.");
        }
        if (email.length > 80) {
            throw new InvalidError("User email must be smaller than 80 characters.");
        }
        if (!birthYear) {
            throw new InvalidError("User must have a birthYear.");
        }
        if (birthYear < 1200 || birthYear > 1500) {
            throw new InvalidError("User birthYear must greater than 1200 and less than 1500.");
        }
        if (!password) {
            throw new InvalidError("User must have a password.");
        }
        if (!isPasswordStrong(password)) {
            throw new InvalidError("User password is weak.");
        }

        return Object.freeze({
            getId: () => id,
            getEmail: () => email,
            getDisplayName: () => displayName,
            getBirthYear: () => birthYear,
            getSignupAt: () => signupAt,
            getLastLoginAt: () => lastLoginAt,
            getPassword: () => password
        });
    }
}
