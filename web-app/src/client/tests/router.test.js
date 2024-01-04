// @ts-nocheck
import { describe, it } from "node:test";
import assert from "node:assert";
import { matchAndCapture } from "../public/js/router.js";

describe("Client Router", () => {
    it("works for /blog/", () => {
        const pathPattern = "/blog";
        let candidate, result;
        // 1
        candidate = "/blog/";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);
        // 2
        candidate = "/blog";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);
        // 3
        candidate = "/blo/g";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true); // doesn't match
        // 4
        candidate = "/blog/10";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true); // doesn't match
        // 5
        candidate = "/blog?cursor=newest&limit=10&direction=older";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);
    });

    it("works for /blog/:id", () => {
        const pathPattern = "/blog/:id";
        let candidate, result;

        candidate = "/blog/";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true); // doesn't match

        candidate = "/blog/1x234few";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);
        assert.strictEqual(result.params.id, "1x234few");

        //  We don't test a candidate like /blog/1x234fex?some_query=10. By design of our backend API, we
        //  won't encounter such cases in our API.
        //  BTW, if we ever decide to implement such things, we could implement like "blog/:id/query?.." in
        //  the backend.

        //  Likewise, we don't test a candidate like "/blog/something/1x234few". Actually, it will incorrectly
        //  match "/blog/:id" pattern and will result in [params.id] become "something/1x234few". We won't encounter
        //  such cases in our API, so let's keep things simple and forget about it
    });


    it("works for /blog/:userId/:id", () => {
        const pathPattern = "/blog/:userId/:id";
        let candidate, result;

        candidate = "/blog/";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true); // doesn't match

        candidate = "/blog/1x234few";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, true); // doesn't match

        candidate = "/blog/345345/1x234few";
        result = matchAndCapture(pathPattern, candidate);
        assert.strictEqual(result == null, false);
        assert.strictEqual(result.params.id, "1x234few");
        assert.strictEqual(result.params.userId, "345345");
    });
});

