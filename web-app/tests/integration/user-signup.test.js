import test, { describe, it } from "node:test";
import assert from "node:assert";
import { clearDb } from "../fixtures/db.js";
import { makeFakeUser } from "../fixtures/user.js";
import { postRequest } from "../fixtures/http-client.js";


test("user signup", { concurrency: false, timeout: 8000 }, async (ctx) => {
    // await ctx.before(async () => {
    //     await clearDb("users");
    // });

    await describe("happy flow", async () => {
        await it("creates a verification code and sends the code to the given email", async () => {
            const user = makeFakeUser({});
            ctx.diagnostic("dfdfdsfjsdjfsdjfsdjfjdsfjsdfjdfjsdjf".repeat(30));
            const response = await postRequest("/api/auth/code", { email: user.email })
                .then(raw => raw.json());
            assert.strictEqual(response.statusCode, 201);
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
});
