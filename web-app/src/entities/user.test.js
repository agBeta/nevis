import test, { describe, it } from "node:test";
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

    it("can create an id if not supplied", (ctx) => {
        const noIdRawUser = makeFakeUser({ id: undefined });
        assert.doesNotThrow(() => makeUser(noIdRawUser));
        const user = makeUser(noIdRawUser);
        assert.strictEqual(typeof user.getId() === "string", true);
        // ctx.diagnostic(user.getId());
    });

    it("can have an id", () => {
        const rawUser = makeFakeUser({});
        assert.doesNotThrow(() => makeUser(rawUser));
    });

    it("should throw error if given id isn't valid", () => {
        //  Note, isCuid has some issues at the moment (2023-12). See https://github.com/paralleldrive/cuid2/issues/66.
        const rawUser = makeFakeUser({ id: "invalid id" });
        assert.strictEqual(rawUser.id, "invalid id");
        assert.throws(() => makeUser(rawUser), {
            name: /StateError/i,
            message: /must have a valid id/i
        });
    });

    it("signupAt is now if signupAt isn't given", () => {
        const noSignupAtRawUser = makeFakeUser({ signupAt: undefined });
        assert.strictEqual(noSignupAtRawUser.signupAt, undefined);
        assert.doesNotThrow(() => makeUser(noSignupAtRawUser));
        const user = makeUser(noSignupAtRawUser);
        assert.strictEqual(typeof user.getSignupAt() === "number", true);
        assert.strictEqual(Date.now() - user.getSignupAt() >= 0, true);
        assert.strictEqual(Date.now() - user.getSignupAt() <= 500, true);
    });

    it("should throw error if email isn't valid", () => {
        const rawUser = makeFakeUser({ email: "invalid" });
        assert.throws(() => makeUser(rawUser), { name: /StateError/i, message: /email/i });
    });

    it.todo("should throw error if birthYear isn't valid");
    it.todo("lastLoginAt is now in UTC if lastLoginAt isn't given");
});

