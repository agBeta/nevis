import Joi from "joi";
import makeHttpError from "../http-error.js";
import makeBasicValidateNormalize from "../validate-normalize.js";
import log from "#utils/log.js";
import { InvalidError } from "#utils/errors.js";

/**
 * POST /auth/signup endpoint controller isn't idempotent. Just for simplicity.
 * @param {*} param0
 * @returns {Controller}
 */
export function makeEndpointController({
    find_code_records_by_email,
    remove_code_records_by_email,
    insert_user,
    compareHash,
    createSecureHash,
    generateCollisionResistentId,
}) {


    return Object.freeze({
        handleRequest,

        validateRequest: makeBasicValidateNormalize({
            schemaOfBody: Joi.object({
                email: Joi.string().email({ allowUnicode: true }).max(80).required(),
                displayName: Joi.string().min(2).max(80).alphanum().required(),
                password: Joi.string().min(3).max(30).required(),
                repeatPassword: Joi.ref("password"),
                birthYear: Joi.number().integer().min(1300).max(1402).required(),
                // must have code. we only register users with verified emails
                code: Joi.string().max(10).required(),
            })
        })
    });


    async function handleRequest(/** @type HttpRequest */ httpRequest) {
        // @ts-ignore
        const /** @type {string} */ email = httpRequest.body.email;
        // @ts-ignore
        const /** @type {string} */ code = httpRequest.body.code;
        // @ts-ignore
        const /** @type {string} */ displayName = httpRequest.body.displayName;
        // @ts-ignore
        const /** @type {string} */ password = httpRequest.body.password;
        // @ts-ignore
        const /** @type {number} */ birthYear = httpRequest.body.birthYear;


        // todo type
        const records = await find_code_records_by_email({ email: email });

        const isCredentialsValid = records.some(async (el) => {
            return await compareHash(code, el.hashedCode);
        });
        // Don't use Promise.any() above as compareHash always resolves.

        if (!isCredentialsValid) {
            return makeHttpError({
                statusCode: 401,
                error: "Invalid credentials. Either code or email is invalid."
            });
        }

        //  Remove all codes related this email.
        //  No need to await.
        remove_code_records_by_email({ email: email })
            .catch(() => {
                // Logging the error, though data-access layer musth have already written some logs.
                log({ level: "error", keyword: "remove-code", message: `failed to remove codes for ${email}` });
            });


        // Due to race conditions, don't check beforehand if the email exists in database or not. See comment at the
        // end of this file for information.
        const hashedPassword = await createSecureHash(password);
        const id = generateCollisionResistentId();
        try {
            await insert_user({
                id,
                email,
                hashedPassword,
                displayName,
                birthYear,
                signupAt: Date.now(),
            });
            // For simplicity we don't redirect, and don't set session cookie.
            return {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
                statusCode: 201,
                payload: JSON.stringify({ success: true, message: "User is successfully created and email is verified." }),
            };
        }
        catch (err) {
            if (err instanceof InvalidError) {
                // It means email already exists.
                return makeHttpError({
                    statusCode: 409,
                    error: "Email is already taken and verified.",
                });
            }
            else {
                // Just send 5xx. Logging is already done inside downstream parties.
                return makeHttpError({
                    statusCode: 500,
                    error: "An unknown error occurred on the server.",
                });
            }
        }

    }
}


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 */


/*
    Don't check beforehand if the email exists in database or not. We may have loads of traffic or even
    application running on several servers. There is slim chance of many signup requests with the same email
    being processed at the same time.
    Even though, concept of "action" is introduced to solve some problems, but still it doesn't solve the situation
    when two different actions are trying to signup with the same email.

    Although eventually only one of them manages to insert a new record (as we have UNIQUE criteria for email in our
    db and db is assumed to be resilient against race conditions), but others will throw an error and
    respond with 5xx status, but then we miss the chance to return 409 status (which is the correct status)
    for those failed requests.
    --->  ❌️  existings = await find_from_users_by_email({ email: email });
    --->      if (existings.length > 0) { .... }
*/
