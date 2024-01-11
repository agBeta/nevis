import { test, expect } from "@playwright/test";
import { getSomeAuth } from "../utils/test-utils.js";

const { userId, pathToAuthFixture } = getSomeAuth();

test.describe("Logout Scenarios", async () => {

    test("@sanity", async({ browser }) => {
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

    test("logout should retry 3 times if failed", async ({ browser }) => {
        const context = await browser.newContext({
            storageState: pathToAuthFixture,
        });
        const page = await context.newPage();
        await page.goto("/");

        let attempts = 0;
        // Let's mock the first 3 attempts to be a failure.
        await page.route(/logout/, (route) => {
            attempts++;
            if (attempts <= 1) {
                route.abort("internetdisconnected");
            }
            else if (attempts < 3) {
                route.fulfill({
                    status: 500,
                    body: JSON.stringify({ success: false, error: "An unknown error occurred on the server." })
                });
            }
            else {
                route.continue();
            }
        });

        const logoutNavItemEl = await page.locator("a[href='/logout']");
        const menuToggleEl = await page.getByLabel(/main menu toggle/i);
        await expect(logoutNavItemEl).toHaveCount(1);
        //  Now let's try to logout. Note, we playwright cannot click on logout nav-item while menu
        //  isn't expanded.
        await menuToggleEl.click();
        await logoutNavItemEl.click();

        //  It should succeed on its third attempt. So...
        //  Main menu should be updated accordingly.
        await expect(page.locator(".nav-item a[href='/login']")).toHaveCount(1);
        await expect(page.locator(".nav-item a[href='/logout']")).toHaveCount(0);
        await expect(page.locator(".nav-item a[href='/post-blog']")).toHaveCount(0);

        // ... and cookies should be removed.
        const cookies = await page.context().cookies();
        const cookieRole = cookies.find(c => c.name.includes("nevis_role"));
        const cookieSessionId = cookies.find(c => c.name.includes("nevis_session_id"));

        await expect(cookieRole).toBeUndefined();
        await expect(cookieSessionId).toBeUndefined();

        // and we should be redirect to home page
        await expect(page).toHaveTitle(/خانه/);
    });
});
