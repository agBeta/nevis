import { test, expect } from "@playwright/test";
import { getSomeAuth } from "../utils/test-utils.js";

const { userId, pathToAuthFixture } = getSomeAuth();

test.describe("Logout Scenarios", async () => {

    test("@sanity", async({ browser, channel }) => {
        // Let's check the auth state is really working.
        const context = await browser.newContext({
            storageState: pathToAuthFixture,
        });
        const page = await context.newPage();
        await page.goto("/");
        // If the user is authenticated, then menu should be display logout button.
        await expect(page.locator(".nav-item a[href='/logout']")).toHaveCount(1);
        await expect(page.locator(".nav-item a[href='/login']")).toHaveCount(0);
    });

    test.skip("logout should retry 3 times if failed", async ({ browser }) => {
        const context = await browser.newContext({
            storageState: pathToAuthFixture,
        });
        const page = await context.newPage();
        await page.goto("/");

        //
    });
});
