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

        await page.click("button[type='submit']");

        // Commented out below. Not working as expected.
        // const loadingSpinner = await page.locator(".signup-step .loading-spinner");
        // await expect(loadingSpinner).toHaveCount(1);

        //  No need to hard wait. You may take a look at https://playwright.dev/docs/actionability.

        // Don't use /نام/ below, since there might be a label containing word ثبت‌نام or similar.
        const displayNameInputBox = await page.getByLabel(/نام کاربری/);
        await displayNameInputBox.fill("some_display_name");

        const birthYearInputBox = await page.getByLabel(/تولد/);
        await birthYearInputBox.fill("1380");

        const passwordInputBox = await page.getByLabel("رمز عبور", { exact: true /*<-- prevent selecting تکرار رمز عبور*/});
        await passwordInputBox.fill("pass123");

        const repeatPasswordInputBox = await page.getByLabel(/تکرار/);
        await repeatPasswordInputBox.fill("pass123");

        const codeInputBox = await page.getByLabel(/کد تایید/);
        //  According to code-post controller implementation the correct code (in e2e mode)
        //  is "123abc". We fill in wrong code.
        await codeInputBox.fill("wrong_");

        await page.click("button[type='submit']");

        const errorHeading = await page.getByRole("heading", { level: 1 });
        await expect(errorHeading).toHaveCount(1);
        await expect(errorHeading).toHaveText(/خطا/);
    });
});
