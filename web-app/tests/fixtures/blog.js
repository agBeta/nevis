import { faker } from "@faker-js/faker/locale/fa";

faker.seed(333);

/**
 * Fake blog from POV of api consumer.
 * @param {*} overrides
 */
export function makeFakeBlog(overrides) {
    const blog = {
        blogTitle: faker.lorem.lines({ min: 10, max: 20 }),
        blogBody: faker.lorem.words({ min: 2, max: 5 }),
        blogTopic: "Technology",
        // no imageUrl
    };
    return {
        ...blog,
        ...overrides,
    };
}
