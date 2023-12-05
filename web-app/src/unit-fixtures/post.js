import { init, isCuid } from "@paralleldrive/cuid2";
import { faker } from "@faker-js/faker/locale/fa";

const Id = Object.freeze({
    createId: init({ length: 24 }),
    isValidId: isCuid
});

faker.seed(456);

/**
 * @param {Object} overrides
 * @returns {import("#types").PostRawInformation}
 */
export default function makeFakeUser(overrides) {

    const _createdAt = faker.date.between({ from: new Date("2021-01-01T00:00:00.000Z"), to: new Date() });
    const _modifiedAt = faker.date.between({ from: _createdAt, to: new Date() });

    const post = {
        id: Id.createId(),
        authorId: Id.createId(),
        postTitle: faker.lorem.word({ length: { min: 5, max: 50 } }),
        postBody: faker.lorem.text(),
        isPublished: true,
        createdAt: _createdAt.getTime(),
        modifiedAt: _modifiedAt.getTime()
    };
    return {
        ...post,
        ...overrides
    };
}
