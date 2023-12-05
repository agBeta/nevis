import { describe, it } from "node:test";
import assert from "node:assert";
import makeFakePost from "../unit-fixtures/post.js";
import { makePost } from "./index.js";


describe("post entity", { concurrency: true }, () => {
    it.todo("should throw error if postTitle is not supplied");
    it.todo("should throw error if authorId is not supplied");
    it.todo("should throw error if given authorId is not valid");
    it.todo("can create an id if not supplied");
    it.todo("sanitizes its postTitle");
    it.todo("sanitizes its postBody");
    it.todo("shouldn't publish by default");
});
