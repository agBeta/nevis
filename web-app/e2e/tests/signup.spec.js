import { test, expect } from "@playwright/test";
import { initializeEverything } from "../utils/test-utils.js";

/**@type {Awaited<ReturnType<initializeEverything>>} */
let Utils;

test.describe("signup scenarios", async () => {
    test.beforeAll(async () => {
        Utils = await initializeEverything({
            seed: { numberOfUsers: 5, numberOfBlogs: 10 }
        });
    });
    test.afterAll(async () => {
        await Utils.closeDbConnections();
        console.log("Gracefully closed DB connection.");
    });


    test("01: Everything is fine but the user gives wrong verification code", async ({ page }) => {
        const email = "not_taken_for_sure@example.com";
        await page.goto("/signup");
        const emailInputBox = await page.getByLabel("ایمیل", {exact: true });
        await emailInputBox.fill(email);

        // await page.click("button[type='submit']");
    });
});
