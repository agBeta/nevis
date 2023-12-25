import * as crypto from "node:crypto";
import bcrypt from "bcrypt";
import { init } from "@paralleldrive/cuid2";

import makeSendEmail from "../send-email/send-email.js";
import {
    count_number_of_blog_post_actions_by_userId,
    find_action_by_actionId,
    find_blog_record_by_blogId,
    find_blog_records_paginated,
    find_code_records_by_email,
    find_session_record_by_hashedSessionId,
    find_user_records_by_email,
    insert_action,
    insert_blog,
    insert_code,
    insert_user,
    insert_session,
    remove_code_records_by_email,
    update_action,
} from "../data-access/index.js";

import { makeEndpointController as make_auth_code_POST_controller } from "./auth/code-post.js";
import { makeEndpointController as make_auth_signup_POST_controller } from "./auth/signup-post.js";
import { makeEndpointController as make_auth_login_POST_controller } from "./auth/login-post.js";
import { makeEndpointController as make_auth_authenticated_as_GET_controller } from "./auth/authenticated_as-get.js";

import { makeEndpointController as make_blog_POST_action_creation_controller } from "./blog/action-create.js";
import { makeEndpointController as make_blog_action_PUT } from "./blog/action-put.js";
import { makeEndpointController as make_blog_blogId_GET } from "./blog/blogId-get.js";
import { makeEndpointController as make_blog_paginated_GET } from "./blog/paginated-get.js";

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
//  Mainly used for generating actionIds. Must be quick. By current design of our API, actionIds are
//  short-lived (unlike ids that we use to store records forever in db), so it doesn't have to collision
//  resistent.
const generateFastId = function () {
    return crypto.randomBytes(16).toString("hex");
};



// 2️⃣️ Now we create controllers by injecting necessary dependencies for each one.

// 🔒
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
    find_code_records_by_email,
    remove_code_records_by_email,
    insert_user,
    compareHash: bcrypt.compare,
    createSecureHash,
    generateCollisionResistentId,
});

const auth_login_POST = make_auth_login_POST_controller({
    find_user_records_by_email,
    insert_session,
    generateSecureId,
});

const auth_authenticated_as_GET = make_auth_authenticated_as_GET_controller({
    find_session_record_by_hashedSessionId,
    createFastHash,
});


// 📝
const blog_POST_action_creation = make_blog_POST_action_creation_controller({
    generateFastId,
    count_number_of_blog_post_actions_by_userId,
    insert_action,
});

const blog_action_PUT = make_blog_action_PUT({
    find_action_by_actionId,
    update_action,
    generateCollisionResistentId,
    insert_blog,
});

const blog_blogId_GET = make_blog_blogId_GET({ find_blog_record_by_blogId });

const blog_paginated_GET = make_blog_paginated_GET({ find_blog_records_paginated });


export {
    auth_code_POST,
    auth_signup_POST,
    auth_login_POST,
    auth_authenticated_as_GET,
    blog_action_PUT,
    blog_blogId_GET,
    blog_paginated_GET,
    blog_POST_action_creation,
};
