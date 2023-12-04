import { init, isCuid } from "@paralleldrive/cuid2";
import { faker } from "@faker-js/faker/locale/fa";

const Id = Object.freeze({
    createId: init({ length: 24 }),
    isValidId: isCuid
});

// To have consistent reproducible results
faker.seed(123);

/**
 * @param {Object} overrides
 * @returns {import("#types").UserRawInformation}
 */
export default function makeFakeUser(overrides) {

    const _birthDate = faker.date.birthdate({ min: 1950, max: 2010, mode: "year" });
    const _signupAt = faker.date.between({ from: new Date("2020-01-01T00:00:00.000Z"), to: new Date() });
    const _lastLoginAt = faker.date.between({ from: _signupAt, to: new Date() });

    const user = {
        id: Id.createId(),
        email: faker.internet.email(),
        displayName: faker.person.fullName(),
        birthYear: getJalaliYear(_birthDate),
        signupAt: _signupAt.getTime(),
        lastLoginAt: _lastLoginAt.getTime()
    };
    return {
        ...user,
        ...overrides
    };
}


/**
 * @param {Date} date
 * @return {number}
 */
function getJalaliYear(date) {
    const /** @type {string} */ yearInFarsiDigits = date.toLocaleDateString("fa", { calendar: "persian" }).slice(0, 4);
    let /** @type {string} */ yearInEnglishDigits = "";
    [...yearInFarsiDigits].forEach(chr => yearInEnglishDigits += "0123456789".charAt("۰۱۲۳۴۵۶۷۸۹".indexOf(chr)));
    return Number(yearInEnglishDigits);

    // side note 1: Number() is better for our use case than parseInt(). See https://stackoverflow.com/a/4564199.
    // side note 2: charAt() is semantically better than [] notation for strings. You can't set the character using [].
}
