import { InvalidStateError } from "#utils/errors";

/**
 * @param {{
 *          Id: import("#types").IdFacility,
 *          hash: (text: string) => string,
 *          sanitize?: (text: string) => string
 * }} injections
 * @returns {import("#types").UserFactory}
 */
export default function buildMakeUser({ Id, hash, sanitize }) {

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
            throw new InvalidStateError("User must have a display name.");
        }
        if (displayName.length < 3) {
            throw new InvalidStateError("User displayName must be longer that 3 characters.");
        }
        if (!email) {
            throw new InvalidStateError("User must have an email");
        }
        if (!email.includes("@") || !email.includes(".")){
            throw new InvalidStateError("User email must be valid.");
        }
        if (!birthYear) {
            throw new InvalidStateError("User must have a birthYear.");
        }
        if (birthYear < 1200 || birthYear > 1500) {
            throw new InvalidStateError("User birthYear must greater than 1200 and less than 1500.");
        }
    }
}
