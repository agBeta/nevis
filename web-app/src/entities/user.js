import { InvalidStateError } from "#utils/errors";

/**
 * @param {{ Id: import("#types").IdFacility }} injections
 * @returns {import("#types").UserFactory}
 */
export default function buildMakeUser({ Id }) {

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
        lastLoginAt = Date.now()
    }) {

        // Early sign of putting application in invalid state helps us debug easier, before invalid object contaminates the rest.
        if (!Id.isValidId(id)) {
            throw new InvalidStateError("User must have a valid id.");
        }
        if (!displayName) {
            throw new InvalidStateError("User must have a displayName.");
        }
        if (displayName.length < 3) {
            throw new InvalidStateError("User displayName must be longer than 2 characters.");
        }
        if (displayName.length > 80) {
            throw new InvalidStateError("User displayName must be smaller than 80 characters.");
        }
        if (!email) {
            throw new InvalidStateError("User must have an email");
        }
        if (!email.includes("@") || !email.includes(".")) {
            throw new InvalidStateError("User email must be valid.");
        }
        if (email.length > 80) {
            throw new InvalidStateError("User email must be smaller than 80 characters.");
        }
        if (!birthYear) {
            throw new InvalidStateError("User must have a birthYear.");
        }
        if (birthYear < 1200 || birthYear > 1500) {
            throw new InvalidStateError("User birthYear must greater than 1200 and less than 1500.");
        }

        return Object.freeze({
            getId: () => id,
            getEmail: () => email,
            getDisplayName: () => displayName,
            getBirthYear: () => birthYear,
            getSignupAt: () => signupAt,
            getLastLoginAt: () => lastLoginAt
        });
    }
}
