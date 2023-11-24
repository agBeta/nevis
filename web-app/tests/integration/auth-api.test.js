import { describe, it } from "node:test";
// import assert from "node:assert";



describe("User Registration", { concurrency: false, timeout: 8000 }, () => {
    it("should return 201 and send verification code to the user", { todo: true }, async () => { });
    it("should verify newly registered email and add email to db", { todo: true }, async () => { });

    it("should store username and password and other information for a verified email and also authenticate the user",
        { todo: true }, async () => { }
    );

    it("should return error when username or password is invalid, though email is verified",
        { todo: true }, async () => { }
    );
    it("should return error when client tries to register username and password but email is NOT verified",
        { todo: true }, async () => { }
    );
});

describe("User Login", { concurrency: false, timeout: 8000 }, () => {
    it("should authenticate client with correct credentials and set session cookie", { todo: true }, async () => { });
    it("should return error when the client tries to login with incorrect credentials",{ todo: true }, async () => { });
});


