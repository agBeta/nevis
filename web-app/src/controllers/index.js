import * as crypto from "node:crypto";
import bcrypt from "bcrypt";
import { init } from "@paralleldrive/cuid2";

import makeSendEmail from "../send-email/send-email.js";
import {
    find_from_sessions_by_hashedSessionId,
    find_from_codes_by_email,
    find_from_users_by_email,
    insert_code,
    insert_user,
    insert_session,
    remove_codes_by_email,
} from "../data-access/index.js";

import { makeEndpointController as make_generic_action_creation_controller } from "./action-post.js";
import { makeEndpointController as make_generic_action_check_status_controller } from "./action-get.js";
import { makeEndpointController as make_auth_code_POST_controller } from "./auth/code-post.js";
import { makeEndpointController as make_auth_signup_POST_controller } from "./auth/signup-post.js";
import { makeEndpointController as make_auth_login_POST_controller } from "./auth/login-post.js";
import { makeEndpointController as make_auth_authenticated_as_GET_controller } from "./auth/authenticated_as-get.js";



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
const createFastHash = async function(/**@type {string}*/ plain) {
    return crypto.createHash("md5").update(plain, "utf-8").digest("base64");
};

const generateCollisionResistentId = init({
    length: 24,
    // less collision between different hosts. Based on https://github.com/paralleldrive/cuid2#configuration.
    fingerprint: (process.env.APP_ID || "app-default"),
});

//  SessionIds are quite short-lived compared to ids we use to stores records. BUT...
//  BUT it must be very secure and hard to guess. So again cuid2 is a better choice.
//  We use different pool of ids for sessionIds.
const generateSecureId = init({
    //  we use md5 hashing before storing in sessions_tbl. So you can freely change the length below. It
    //  will always result in a 24 character base64 string.
    length: 32,
    fingerprint: crypto.randomBytes(4).toString("hex"),
});



// 2️⃣️ Now we create controllers by injecting necessary dependencies for each one.

const auth_code_POST = make_auth_code_POST_controller({
    insert_code,
    generateCode: function () {
        //  Don't use Math.random() or timestamp. See https://stackoverflow.com/a/14869745 for a detailed explanation.
        return Promise.resolve(crypto.randomBytes(3).toString("hex"));
    },
    createSecureHash,
    sendEmail,
});

const auth_signup_POST = make_auth_signup_POST_controller({
    find_from_codes_by_email,
    remove_codes_by_email,
    insert_user,
    compareHash: bcrypt.compare,
    createSecureHash,
    generateCollisionResistentId,
});

const auth_login_POST = make_auth_login_POST_controller({
    find_from_users_by_email,
    insert_session,
    generateSecureId,
});

const auth_authenticated_as_GET = make_auth_authenticated_as_GET_controller({
    find_from_sessions_by_hashedSessionId,
    createFastHash,
});


const generic_action_creation_POST = make_generic_action_creation_controller({
    // Generating actionId MUST be quick. actionIds are short-lived (unlike ids that we use to store records in db).
    // So keep it simple and forget about collision resistance. It's a rabbit hole.
    generateActionId: function () {
        return crypto.randomBytes(12).toString("hex");
    }
});
const generic_action_status_GET = make_generic_action_check_status_controller({ find_action_by_id });



export {
    generic_action_creation_POST,
    generic_action_status_GET,
    auth_code_POST,
    auth_signup_POST,
    auth_login_POST,
    auth_authenticated_as_GET,
};
