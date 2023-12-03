import test from "node:test";
import assert from "node:assert";


test("User Signup - Happy Flow", { concurrency: false, timeout: 8000, todo: true }, async (t) => {

    await t.test("should return 201 and send the generated code to the given email and store the generated code in codes db", async () => {
        // post email to api
        // check if email sending function is invoked
        // check if code is added in the database
    });

    await t.test("should verify the given email and add the user to db", async () => {
        // add a code,email to the code db
        // post email,code,user details to api
        // check if user is added to the database
        // check if signupAt and lastLoginAt is correct
    });

    await t.test("should verify the given email and set session cookie", async () => {
        // add a code,email to code db
        // post email,code,user details to api
        // check if session cookie is set
        // check if hitting auth/ routes return user id
    });
});


// describe("User Login", { concurrency: false, timeout: 8000 }, () => {
//     it("should authenticate client with correct credentials and set session cookie", { todo: true }, async () => { });
//     it("should return error when the client tries to login with incorrect credentials",{ todo: true }, async () => { });
// });


/**
 * @typedef {import("#types").WebAppServer} WebAppServer
 */
