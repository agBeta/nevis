import test, { describe, it, before, after } from "node:test";
import assert from "node:assert";
import * as DbFixture from "../fixtures/db.js";
import { makeFakeUser } from "../fixtures/user.js";
import { postRequest } from "../fixtures/http-client.js";

test("user signup", { concurrency: false, timeout: 8000 }, async (ctx) => {
    before(async () => {
        await DbFixture.clearDb("users");
    });

    await describe("happy flow", async () => {
        it("creates a verification code and sends the code to the given email", async () => {
            const user = makeFakeUser({});
            const raw = await postRequest("/api/auth/code", { email: user.email });
            const response = await raw.json();

            assert.strictEqual(raw.status, 201);
            assert.strictEqual(201, 201);
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
