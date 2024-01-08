import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({
    path: path.resolve(new URL(".", import.meta.url).pathname, "e2e.env"),
    override: true
});

const PORT = process.env.PORT;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: "./tests",
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    // fullyParallel: true,
    fullyParallel: false,
    /* Opt out of parallel tests on CI. */ // workers: process.env.CI ? 1 : undefined,
    workers: process.env.CI ? 1 : 2,


    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: "html",
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        // PORT is from e2e.env
        baseURL: `http://localhost:${PORT}`,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chrome",
            use: {
                ...devices["Desktop Chrome"],
                channel: "chrome",
            },
        },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        //  We cannot use "npm run start:e2e" in our command, because it will throw permission denied
        //  error. So we simply copied content of "start:e2e" script from parent package.json file
        //  and removed it from there. Finally...
        command: "cd .. && NODE_ENV=e2e node ./src/main.js",
        //  The url on your http server that is expected to return a 2xx, 3xx, 400, 401, 402, or 403 status
        //  code when the server "is ready to accept connections".
        url: `http://localhost:${PORT}/api/v1/ready`,
        reuseExistingServer: !process.env.CI,
    },
});

