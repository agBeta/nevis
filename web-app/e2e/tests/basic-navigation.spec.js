import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/خانه/);
});

test("has correct on /blog/paginated", async({ page }) => {
    await page.goto("/blog/paginated");
    await expect(page).toHaveTitle(/نوشته‌ها/);
} );

test.only("doesn't break when we have a hash (#) at the end of url", async({ page }) => {
    //  Don't test goto("/"), because most of the time, when routing fails we redirect
    //  to homepage. So it's safer to test it on another page. So...
    await page.goto("/signup#some_hash");
    await expect(page).toHaveTitle(/ثبت/);
});
