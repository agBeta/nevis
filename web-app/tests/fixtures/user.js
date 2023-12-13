import { faker } from "@faker-js/faker/locale/fa";

faker.seed(789);

/**
 * Creates a fake user from POV of api consumer.
 * NOTE, it is different from makeFakeUser in src/unit-fixtures/user.js.
 * @param {*} overrides
 */
export function makeFakeUser(overrides) {
    const user = {
        email: faker.internet.email(),
        displayName: faker.person.fullName(),
        birthYear: faker.number.int({ min: 1330, max: 1395 })
    };
    return {
        ...user,
        ...overrides
    };
}
