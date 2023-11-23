import { describe, it } from "node:test";
import assert from "node:assert";

describe("User Authentication API", { concurrency: false, timeout: 8000 }, () => {
    it("should register a new user", { only: true }, async() => {
        assert.strictEqual(1, 2);
    });
});


