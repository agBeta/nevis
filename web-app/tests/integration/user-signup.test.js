import test, { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as DbFixture from "../fixtures/db.js";
import { makeFakeUser } from "../fixtures/user.js";
import { postRequest } from "../fixtures/http-client.js";

test("user signup", { concurrency: false, timeout: 8000 }, async (ctx) => {

    before(async () => {
        await DbFixture.clearDb("codes");
        await DbFixture.clearDb("users");
    });

    await describe("happy flow", async () => {
        it("creates a signup code and stores in db", async () => {
            const user = makeFakeUser({});

            const raw = await postRequest("/api/auth/code", { email: user.email, purpose: "signup" });
            assert.strictEqual(raw.status, 201);

            const correspondingRecords = await DbFixture.findInCodesDb(user.email);
            assert.strictEqual(correspondingRecords.length == 1, true);

            const exp = correspondingRecords[0].expiresAt;
            assert.strictEqual(exp instanceof Date, true);
            assert.strictEqual(exp.getTime() > Date.now() + 5 * 60 * 1000, true);

            assert.strictEqual(correspondingRecords[0].purpose, "signup");
        });

        // describe.todo("GIVEN supplied verification code and user profile details are valid", () => {
        //     it.todo("creates the user in db", async () => {

        //     });
        //     it.todo("sets session cookie");
        //     it.todo("returns user id");
        // });
    });

    // it.todo("returns 400 and does not create code if no email is supplied");
    // it.todo("returns 409 if given email already exists");

    after(async () => {
        await DbFixture.closeConnections();
    });
});
