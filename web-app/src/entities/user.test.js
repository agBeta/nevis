import { describe, it } from "node:test";
import assert from "node:assert";
import makeFakeUser from "../unit-fixtures/user.js";
import { makeUser } from "./index.js";


describe("user entity", { concurrency: true }, () => {
    it("should throw error if displayName isn't valid", () => {
        const rawUser = makeFakeUser({ displayName: null });
        assert.throws(() => makeUser(rawUser), {
            name: /StateError/i,
            message: /must have a displayName/i
        });
    });

    it.todo("should throw error if email isn't valid");
    it.todo("should throw error if birthYear isn't valid");

    it.todo("should throw error if given id isn't valid");
    it.todo("should create id if id isn't given");
    it.todo("signupAt is now in UTC if signupAt isn't given");
    it.todo("lastLoginAt is now in UTC if lastLoginAt isn't given");
});

