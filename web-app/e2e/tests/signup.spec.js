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
        console.log("🔈 Gracefully closed DB connection.");
    });


    test("01: Everything is fine but the user gives wrong verification code", async ({ page }) => {
        const email = "not_taken_for_sure@example.com";
        await page.goto("/signup");
        const emailInputBox = await page.getByLabel("ایمیل", { exact: true });
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

        const passwordInputBox = await page.getByLabel("رمز عبور", { exact: true /*<-- prevent selecting تکرار رمز عبور*/ });
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

    test("02: preserves state when user navigates to another page and comes back to signup page", async ({ page }) => {
        await page.goto("/signup");
        const menuToggleEl = await page.getByLabel(/main menu toggle/i);
        const mainMenu = await page.getByLabel("Main Menu", { exact: true /*<--- to exclude toggle*/ });

        // Menu and menu toggle should exist
        await expect(menuToggleEl).toHaveCount(1);
        await expect(mainMenu).toHaveCount(1);
        // ... and have correct attributes (also crucial as css styling is based on these attributes)
        await expect(menuToggleEl).toHaveAttribute("aria-expanded", "false");

        //  Let's write something in the form.
        const email = "not_taken_for_sure@example.com";
        let emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        await emailInputBox.fill(email);
        // Let's go to next step. By design, without going to next step, the email won't be preserved.
        await page.click("button[type='submit']");

        //  Now, let's switch to another page (home page).
        await menuToggleEl.click();

        //  🔷
        //  As we're deep into this rabbit hole, let's also check whether some other things
        //  are set correctly or not, though they aren't related to this test.

        await expect(mainMenu).toHaveAttribute("aria-hidden", "false");
        await expect(menuToggleEl).toHaveAttribute("aria-expanded", "true");

        // In order to switch back/forth we need to grab these elements:
        const homeNavItemEl = await page.locator("a[href='/']");
        const signupNavItemEl = await page.locator("a[href='/signup']");
        // ... and they should exist.
        await expect(homeNavItemEl).toHaveCount(1);
        await expect(signupNavItemEl).toHaveCount(1);

        //  before we navigate, we are already in /signup route, so the corresponding nav item should
        //  be different from others. Css style is based in this attribute.
        await expect(signupNavItemEl).toHaveAttribute("aria-current", "page");

        // Let's navigate to home.
        await homeNavItemEl.click();
        // First we make sure, the router really navigated us to home.
        await expect(signupNavItemEl).not.toHaveAttribute("aria-current", "page");
        await expect(page).toHaveTitle(/خانه/);

        // Now let's go back to /signup using back button.
        await page.goBack();
        // First we make sure, the router really navigated us BACK to signup.
        await expect(page).toHaveTitle(/ثبت‌نام/);

        //  Let's check if the state is preserved.
        //  First we should be in signup step
        await expect(page.getByText("نام کاربری")).toHaveCount(1);
        //  Now we check when we go back one step, the email input field is populated. First we need to
        //  click go-back button.
        const goBackButton = await page.getByTitle(/مرحله قبل/);
        await goBackButton.click();

        emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        await expect(emailInputBox).toHaveValue(email); // email is preserved
    });


    test.only("03: display validation errors live for each input field (especially birth year)", async ({ page }) => {
        await page.goto("/signup");

        const email = "not_taken_for_sure@example.com";
        // Let's fill in the email step and move forward
        let emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        await emailInputBox.fill(email);
        await page.click("button[type='submit']");

        const birthYearInputBox = await page.getByLabel(/تولد/);
        // await birthYearInputBox.fill("۱۳۸۰", { force: true }); --> error: Cannot type text into input[type=number]
        await birthYearInputBox.fill("1500" /* anything greater than 1402 is invalid */);
        await birthYearInputBox.blur();

        const fge = await page.getByTestId("form-group-email");
        await expect(fge).toHaveAttribute("data-error", /نامعتبر/);
        //  The error should be visible on the page, but since we use pseudo-elements it's quite
        //  difficult (see https://stackoverflow.com/a/77222265). Line below will fail.
        // await expect(page.getByText(/نامعتبر/)).toBeVisible(); --> fails

        // Now let's type something valid and make sure the error will disappear
        await birthYearInputBox.fill("1360");
        await birthYearInputBox.blur();
        await expect(fge).not.toHaveAttribute("data-error");
    });
});
