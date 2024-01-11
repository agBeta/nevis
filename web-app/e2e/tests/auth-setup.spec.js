import path from "node:path";
import { test as setup, expect } from "@playwright/test";
import { getSomeRealUsers } from "../utils/test-utils.js";

//  Inspired by https://playwright.dev/docs/auth#basic-shared-account-in-all-tests.

const pathToAuthFile = path.resolve(
    new URL(".", import.meta.url).pathname, "..", "fixtures", "auth_"
);
let /**@type ReturnType<getSomeRealUsers>[number]*/ realUser1;

setup.describe("@Auth Setup", async () => {
    setup.beforeAll(() => {
        realUser1 = getSomeRealUsers(/*n=*/1)[0];
    });

    setup("@setup save auth cookies",  async ({ page }) => {
        await page.goto("/login");

        // First make sure we aren't logged in. Not sure if it's necessary. We had some issues.
        let cookies = await page.context().cookies();
        let cookieRole = cookies.find(c => c.name.includes("nevis_role"));
        await expect(cookieRole).toBeUndefined();

        const emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        const passwordInputBox = await page.getByLabel("رمز عبور", { exact: true });

        await expect(emailInputBox).toHaveCount(1);
        
        await emailInputBox.fill(realUser1.email);
        await passwordInputBox.fill(realUser1.password);
        await page.click("button[type='submit']");

        //  🔷 We MUST wait for response. Otherwise the playwright will immediately grab the cookies and
        //  since the response from server hasn't come back yet, session cookies aren't set yet. So the
        //  test (actually) setup will fail and no auth fixture will be stored.
        await page.waitForResponse(response =>
            response.status() === 200 && response.url().includes("/auth/login")
        );

        cookies = await page.context().cookies();
        // Recall when NODE_ENV=e2e name of cookies doesn't have __Host- prefix.
        cookieRole = cookies.find(c => c.name.includes("nevis_role"));
        const cookieSessionId = cookies.find(c => c.name.includes("nevis_session_id"));
        await expect(cookieRole).toBeDefined();
        await expect(cookieSessionId).toBeDefined();

        await page.context().storageState({ path: pathToAuthFile + `${realUser1.id}.json` });
    });
});
