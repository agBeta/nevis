import { describe, it } from "node:test";
import assert from "node:assert";
import makeFakePost from "../unit-fixtures/post.js";
import { makePost } from "./index.js";


describe("post entity", { concurrency: true }, () => {
    it("should create post entity", () => {
        const rawPost = makeFakePost({});
        assert.strictEqual(rawPost.postTitle.length > 1, true);
        assert.strictEqual(rawPost.authorId.length > 1, true);
        const post = makePost(rawPost);
        assert.strictEqual(Object.prototype.hasOwnProperty.call(post, "getCreatedAt"), true);
    });
    it("should throw error if postTitle is not supplied", () => {
        const rawPost = makeFakePost({ postTitle: undefined });
        assert.throws(() => makePost(rawPost), {
            name: /Invalid/i,
            message: /postTitle/i
        });
    });
    it("should throw error if authorId is not supplied", () => {
        const rawPost = makeFakePost({ authorId: undefined });
        assert.throws(() => makePost(rawPost), {
            name: /Invalid/i,
            message: /authorId/i
        });
    });
    it("should throw error if given authorId is not valid", () => {
        const rawPost = makeFakePost({ authorId: "something invalid" });
        assert.throws(() => makePost(rawPost), {
            name: /Invalid/i,
            message: /valid authorId/i
        });
    });
    it("can create an id if not supplied", () => {
        const idLessRawPost = makeFakePost({ id: undefined });
        assert.strictEqual(idLessRawPost.id == null, true);
        const post = makePost(idLessRawPost);
        assert.strictEqual(post.getId().length > 1, true);
    });

    it("can have postTitle", () => {
        const rawPost = makeFakePost({ postTitle: "Something Fine" });
        assert.strictEqual(rawPost.postTitle, "Something Fine" );
        const post = makePost(rawPost);
        assert.strictEqual(post.getPostTitle(), "Something Fine" );
    });

    it("sanitizes its postTitle", () => {
        const sane = makePost({
            ...makeFakePost({ postTitle: "<p>یک عنوان درست</p>" })
        });
        const insane = makePost({
            ...makeFakePost({ postTitle: "<script>This is not so fine</script><p>but this is ok</p>" })
        });
        assert.strictEqual(sane.getPostTitle(), "<p>یک عنوان درست</p>");
        assert.strictEqual(insane.getPostTitle(), "<p>but this is ok</p>");

        const totallyInsaneRawPost = makeFakePost({ postTitle: "<script>You are hacked.</script>" })
        assert.throws(() => makePost(totallyInsaneRawPost), {
            name: /Invalid/i,
            message: /no usable text/i
        });
    });

    it.todo("sanitizes its postBody");
    it.todo("shouldn't publish by default");
});
