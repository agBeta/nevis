const { run } = require("node:test");
const { finished } = require("node:stream");

const stream = run({
    files: [
        "tests/integration/*.test.js"
    ],
    setup: async () => {
        console.log("🖥️  Test Setup...");
    }
});

finished(stream, () => {
    console.log("⚒️  Teardown...");
});

stream.pipe(process.stdout);