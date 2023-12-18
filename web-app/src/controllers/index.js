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

import { makeEndpointController as makePostAuthCodeController } from "./auth-code-post.js";
import { makeEndpointController as makePostSignupController } from "./auth-signup-post.js";

// Create functions on which our controllers rely, so that we can inject them.
const sendEmail = makeSendEmail({
    mailServiceHost: process.env.MAIL_HOST,
    mailServicePort: process.env.MAIL_PORT,
    mailServiceUser: process.env.MAIL_SMTP_USERNAME,
    mailServicePassword: process.env.MAIL_SMTP_PASSWORD,
    mailServiceFromAddress: process.env.MAIL_FROM_ADDRESS,
});
const createSecureHash = async function(/**@type {string}*/ plain) {
    return bcrypt.hash(plain, 9);
};
const generateCollisionResistentId = init({
    length: 24,
    // less collision between different hosts. Based on https://github.com/paralleldrive/cuid2#configuration.
    fingerprint: (process.env.APP_ID || "app-default"),
});


// Now we create instances of controller by injecting necessary dependencies for each one.
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
    find_from_users_by_email,
    insert_user_into_db,
    compareHash: bcrypt.compare,
    createSecureHash,
    generateCollisionResistentId,
});


export {
    postAuthCode,
    postSignup,
};
