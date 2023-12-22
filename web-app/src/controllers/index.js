import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import { init } from "@paralleldrive/cuid2";

import makeSendEmail from "../send-email/send-email.js";
import {
    find_from_codes_by_email,
    remove_codes_by_email,
    insert_code_into_db,
    insert_user_into_db,
    find_action_by_id,
    insert_action,
} from "../data-access/index.js";

import { makeEndpointController as make_generic_action_creation_controller } from "./action-post.js";
import { makeEndpointController as make_generic_action_check_status_controller } from "./action-get.js";
import { makeEndpointController as make_auth_code_POST_controller } from "./auth/auth-code-post.js";
import { makeEndpointController as make_auth_signup_action_PUT_controller } from "./auth/auth-signup-action-put.js";



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




// 2️⃣️ Now we create controllers by injecting necessary dependencies for each one.

const generic_action_creation_POST = make_generic_action_creation_controller({
    generateActionId: function () {
        // Generating actionId MUST be quick. actionIds are short-lived (unlike ids that we use to store entities in db).
        // So keep it simple and forget about collision resistance. It's a rabbit hole.
        return randomBytes(12).toString("hex");
    }
});
const generic_action_status_GET = make_generic_action_check_status_controller({ find_action_by_id });


const auth_code_POST = make_auth_code_POST_controller({
    insert_code_into_db,
    generateCode: function () {
        //  Don't use Math.random() or timestamp. See https://stackoverflow.com/a/14869745 for a detailed explanation.
        return Promise.resolve(randomBytes(3).toString("hex"));
    },
    createSecureHash,
    sendEmail,
});

const auth_signup_action_PUT = make_auth_signup_action_PUT_controller({
    find_from_codes_by_email,
    remove_codes_by_email,
    insert_user_into_db,
    find_action_by_id,
    compareHash: bcrypt.compare,
    createSecureHash,
    generateCollisionResistentId,
});

const auth_signup_action_GET = { ...generic_action_status_GET };



export {
    generic_action_creation_POST,
    generic_action_status_GET,
    auth_code_POST,
    auth_signup_action_PUT,
    auth_signup_action_GET,
};
