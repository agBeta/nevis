import { NAME_OF_SESSION_COOKIE } from "../../config.js";

/**
 * @param {{
 *      remove_session_record_by_hashedSessionId: import("#types").Remove_Session,
 *      createFastHash: (plain: string) => string
 * }} param0
 * createFastHash should be exactly the same hash function used in login-post controller.
 * @returns {Controller}
 */
export function makeEndpointController({
    remove_session_record_by_hashedSessionId,
    createFastHash,
}) {

    return Object.freeze({
        handleRequest,
        validateRequest: function () {
            return { isValid: true };
        }
    });

    /** @returns {Promise<HttpResponse & { cookies: import("#types").SetCookie[] }>} */
    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {

        if (!httpRequest.cookies || Object.keys(httpRequest.cookies).length === 0
            || !httpRequest.cookies[NAME_OF_SESSION_COOKIE]
            /* ↘️ to prevent running md5 hash on a long string */
            || httpRequest.cookies[NAME_OF_SESSION_COOKIE].length > 40
        ) {
            return makeHttp200ResponseAndClearCookies();
        }

        const sessionId = httpRequest.cookies[NAME_OF_SESSION_COOKIE];
        const hashedSessionId = createFastHash(sessionId);
        await remove_session_record_by_hashedSessionId({ hashedSessionId });

        return makeHttp200ResponseAndClearCookies();
    }


    function makeHttp200ResponseAndClearCookies() {
        //  Clearing the following isn't necessary from security aspect, but to simplify job of
        //  frontend, we clear it.
        const NAME_OF_ROLE_COOKIE = "nevis_role";

        //  Based on https://stackoverflow.com/a/27981898.
        //  Also according to express docs (for res.clearCookie), Web browsers and other compliant
        //  clients will only clear the cookie if the given options is identical to those given
        //  to res.cookie(), excluding expires and maxAge.
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store", // Is it necessary? not sure.
            },
            payload: JSON.stringify({ success: true }),
            cookies: [
                {
                    name: NAME_OF_SESSION_COOKIE,
                    // By setting value to "" and maxAge to 0, we basically clear the cookie.
                    value: "",
                    options: {
                        secure: true,
                        httpOnly: process.env.NODE_ENV === "e2e" ? false : true,
                        maxAge: 0,
                    }
                },
                {
                    name: NAME_OF_ROLE_COOKIE,
                    value: "",
                    options: { secure: true, httpOnly: false, maxAge: 0 }
                }
            ],
        };
    }
}



/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 * @typedef {import("#types").Remove_Session} Remove_Session
 */
