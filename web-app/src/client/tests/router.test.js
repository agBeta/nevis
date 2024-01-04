import { describe, it } from "node:test";
import assert from "node:assert";
import { matchAndCapture } from "../public/js/router.js";

describe("Client Router", () => {
    it("works (/blog/)", () => {
        const pathPattern = "/blog";

        let candidate = "/blog/";
        let result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);

        candidate = "/blog";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);

        candidate = "/blo/g";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true);

        candidate = "/blog/10";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true);

        candidate = "/blog?cursor=newest&limit=10&direction=older";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);
    });

});

