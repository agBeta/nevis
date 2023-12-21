import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { init } from "@paralleldrive/cuid2";

import makeSendEmail from "../send-email/send-email.js";
import {
    find_from_codes_by_email,
    find_from_users_by_email,
    remove_codes_by_email,
    insert_code_into_db,
    insert_user_into_db,
} from "../data-access/index.js";

import makeGenerateActionAndRespond from "./action.js";
import { makeEndpointController as makePostAuthCodeController } from "./auth-code-post.js";
import { makeEndpointController as makePostSignupController } from "./auth-signup-put.js/index.js";

// 1️⃣️ Create functions on which our controllers rely, so that we can inject them.
export const sendEmail = makeSendEmail({
    mailServiceHost: process.env.MAIL_HOST,
    mailServicePort: process.env.MAIL_PORT,
    mailServiceUser: process.env.MAIL_SMTP_USERNAME,
    mailServicePassword: process.env.MAIL_SMTP_PASSWORD,
    mailServiceFromAddress: process.env.MAIL_FROM_ADDRESS,
});
const createSecureHash = async function (/**@type {string}*/ plain) {
    return bcrypt.hash(plain, 9);
};
const generateCollisionResistentId = init({
    length: 24,
    // less collision between different hosts. Based on https://github.com/paralleldrive/cuid2#configuration.
    fingerprint: (process.env.APP_ID || "app-default"),
});
// Generating actionIds MUST be quick, actionIds are short-lived (unlike ids we use to store entities in db).
const generateActionId = function () {
    return randomBytes(10).toString("hex");
};

const generateActionAndRespond = makeGenerateActionAndRespond({ generateActionId });


// 2️⃣️ Now we create controllers by injecting necessary dependencies for each one.


//  But before creating other controllers, let's create a generic controller to handle action creation on ANY
//  endpoint. In future, we may decide to assign specific controller (responsible for action creation) which is
//  fine-designed based on the particular endpoint. Like not allowing action for some resource based on httpRequest
//  userId, path, etc.

/** Generic controller (for any endpoint) to create action  */
const postAction = Object.freeze({
    handleRequest: generateActionAndRespond,
    validateRequest: () => ({ isValid: true })
});



const postAuthCode = makePostAuthCodeController({
    insert_code_into_db,
    //  Don't use Math.random() or timestamp. See https://stackoverflow.com/a/14869745 for a detailed explanation.
    generateCode: function () {
        return Promise.resolve(randomBytes(3).toString("hex"));
    },
    createSecureHash,
    sendEmail,
});

const postSignup = makePostSignupController({
    find_from_codes_by_email,
    remove_codes_by_email,
    insert_user_into_db,
    compareHash: bcrypt.compare,
    createSecureHash,
    generateCollisionResistentId,
});


export {
    postAction,
    postAuthCode,
    postSignup,
};
