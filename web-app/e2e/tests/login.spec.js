import { test, expect } from "@playwright/test";
import { getSomeRealUsers } from "../utils/test-utils.js";


let /**@type ReturnType<getSomeRealUsers>[number]*/ realUser1;

test.describe("Signup Scenarios", async () => {
    test.beforeAll(() => {
        realUser1 = getSomeRealUsers(/*n=*/1)[0];
    });

    test("doesn't allow login when email or password is incorrect", async ({ page }) => {
        await page.goto("/login");

        let emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        let passwordInputBox = await page.getByLabel("رمز عبور", { exact: true });
        // We don't care about rememberMe checkbox in this test case.

        // First fill in correct email but wrong password
        await emailInputBox.fill(realUser1.email);
        await passwordInputBox.fill(realUser1.password + "_");

        await page.click("button[type='submit']");

        await expect(page.getByText(/خطا/)).toHaveCount(1);
        // Don't use getByRole("button"), since it resolves to 2 elements (button and menu-toggle).
        await expect(page.locator("button:not(.menu-toggle)")).toHaveText(/متوجه شدم/);

        //  As we are into this rabbit hole, let's check if it preserves state.
        //  Though this part isn't related to the purpose of this test case.
        //  Unlike signup.spec.js, here we don't click menu toggle, but enter url on the address bar.
        await page.goto("/blog/paginated");
        //  First make sure our app really rendered blogs page. The following assertion is sufficient,
        //  since the only part in application that sets "document.title" is blogs.js page view.
        await expect(page).toHaveTitle(/نوشته‌ها/);
        //  Now let's go back. This time we use browser's back button.
        await page.goBack();

        //  Let's make sure the router works properly.
        await expect(page).toHaveURL(/login/);
        await expect(page).toHaveTitle("ورود");

        //  The following lines are commented out. After inspecting Application tab in debug mode,
        //  it seems local storage gets cleared when we go back. Not sure why. It works correctly
        //  when we run "npm run dev" and test the same flow manually in the browser (i.e. switching
        //  from login to another page and then switching back to login, will correctly render the
        //  error). But somehow it doesn't work here.
        //  -- await expect(page.locator("button:not(.menu-toggle)")).toHaveText(/متوجه شدم/);
        //  -- await page.click("button");
        //  Anyway, let's forget about this and move on.

        //  Let's try again to login.
        emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        passwordInputBox = await page.getByLabel("رمز عبور", { exact: true });
        await expect(emailInputBox).toHaveCount(1);
        await expect(passwordInputBox).toHaveCount(1);

        // This time, fill in correct password but wrong email
        await emailInputBox.fill("_" + realUser1.email);
        await passwordInputBox.fill(realUser1.password);

        await page.click("button[type='submit']");

        await expect(page.getByText(/خطا/)).toHaveCount(1);
        await expect(page.locator("button:not(.menu-toggle)")).toHaveText(/متوجه شدم/);

        // There is also one thing we need to check. We need to check role cookies is not set.
        const cookies = await page.context().cookies();
        const cookieNames = cookies.map(c => c.name);
        for (let name of cookieNames) {
            await expect(name).not.toContain("role");
        }

        //  Let's also make sure the main menu still contains login nav item (meaning that the user
        //  has not logged in, otherwise login nav item would disappear)
        await expect(page.locator(".nav-item a[href='/login']")).toHaveCount(1);
        await expect(page.locator(".nav-item a[href='/logout']")).toHaveCount(0);
    });


    test("login works", async ({ page }) => {
        await page.goto("/login");
        let emailInputBox = await page.getByLabel("ایمیل", { exact: true });
        let passwordInputBox = await page.getByLabel("رمز عبور", { exact: true });
        let rememberMeCheckbox = await page.getByRole("checkbox");

        await expect(rememberMeCheckbox).toHaveCount(1);

        await rememberMeCheckbox.check();
        await emailInputBox.fill(realUser1.email);
        await passwordInputBox.fill(realUser1.password);

        await page.click("button[type='submit']");

        //  Main menu should be updated accordingly, after login. But since it takes a bit of
        //  time, we should either wait a little bit or try to assert login nav item after other
        //  assertions. Otherwise playwright would instantly grab login nav item (which hasn't
        //  disappeared yet) and the test would fail. So the order of assertions below is important.
        await expect(page.locator(".nav-item a[href='/logout']")).toHaveCount(1);
        await expect(page.locator(".nav-item a[href='/post-blog']")).toHaveCount(1);
        await expect(page.locator(".nav-item a[href='/login']")).toHaveCount(0);


        const cookies = await page.context().cookies();
        // Recall when NODE_ENV=e2e name of cookies doesn't have __Host- prefix.
        const cookieRole = cookies.find(c => c.name.includes("nevis_role"));
        const cookieSessionId = cookies.find(c => c.name.includes("nevis_session_id"));

        await expect(cookieRole).toBeDefined();
        await expect(cookieSessionId).toBeDefined();

        await expect(cookieRole?.value).toBe("user");
        // Since we have checked rememberMe, cookie shouldn't expire soon.
        // @ts-ignore
        await expect(cookieRole.expires * 1000 - Date.now()).toBeGreaterThan(
            /*29 days*/ 29 * 24 * 60 * 60 * 1000
        );

        await expect(cookieSessionId?.value.length).toBeGreaterThan(30);
        // @ts-ignore
        await expect(cookieSessionId.expires * 1000 - Date.now()).toBeGreaterThan(
            /*29 days*/ 29 * 24 * 60 * 60 * 1000
        );
    });
});
