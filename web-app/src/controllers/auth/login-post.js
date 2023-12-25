import Joi from "joi";
import makeHttpError from "../http-error.js";
import makeBasicValidateNormalize from "../validate-normalize.js";

/**
 * POST /auth/login endpoint controller isn't idempotent. Just for simplicity.
 * @param {*} param0
 * @returns {Controller}
 */
export function makeEndpointController({
    find_user_records_by_email,
    insert_session,
    compareHash,
    generateSecureId,
}) {

    return Object.freeze({
        handleRequest,

        validateRequest: makeBasicValidateNormalize({
            schemaOfBody: Joi.object({
                email: Joi.string().email({ allowUnicode: true }).max(80).required(),
                password: Joi.string().min(3).max(30).required(),
                rememberMe: Joi.boolean().required(),
            })
        })
    });


    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {
        // @ts-ignore
        const /**@type {string}*/ email = httpRequest.body.email;
        // @ts-ignore
        const /**@type {string}*/ password = httpRequest.body.password;
        // @ts-ignore
        const /**@type {boolean}*/ rememberMe = httpRequest.body.rememberMe;

        const records = await find_user_records_by_email({ email });
        if (!records) {
            return makeHttpError({
                statusCode: 401,
                error: "Either email or password is incorrect."
            });
        }

        const user = records.find(async function checkIfPasswordMatches(el) {
            return await compareHash(password, el.hashedPassword);
        });
        if (!user) {
            return makeHttpError({
                statusCode: 401,
                error: "Either email or password is incorrect."
            });
        }

        // We don't remove current sessions of the user. Not any particular reason. May session attacks? I don't
        // know at the moment. Need to  investigate more.

        const sessionId = generateSecureId();
        const lifespanInSeconds = (rememberMe ? 30 * 24 * 60 * 60 : 3 * 60 * 60);
        const expiresAt = Date.now() + lifespanInSeconds * 1000;

        await insert_session({
            sessionId,
            userId: user.id,
            expiresAt,
        });

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                // Very crucial to set correct cache-control here.
                "Cache-Control": "no-store",
            },
            /**@type {SetCookie[]}*/ cookies: [
                {
                    // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#__host-.
                    name: "__Host-nevis_session_id",
                    value: sessionId,
                    options: {
                        secure: process.env.NODE_ENV === "test" ? false : true,
                        httpOnly: true,
                        sameSite: "lax",
                        maxAge: lifespanInSeconds,
                    }
                },
                {
                    name: "__Host-nevis_role",
                    value: "user",
                    options: {
                        secure: process.env.NODE_ENV === "test" ? false : true,
                        httpOnly: false, // can be used by frontend to implement offline functionality
                        sameSite: "lax",
                        maxAge: lifespanInSeconds,
                    }
                }
            ],
            payload: JSON.stringify({
                success: true,
                userId: user.id, // Ad-hoc decision to send some of user info as well. We don't care.
            })
        };
    }
}


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 * @typedef {import("#types").SetCookie} SetCookie
 */
