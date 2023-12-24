import makeHttpError from "../http-error.js";

const NAME_OF_SESSION_COOKIE = "__Host-nevis_sessionId";

/**
 * @param {*} param0
 * @returns {Controller}
 */
export function makeEndpointController({
    find_from_sessions_by_hashedSessionId,
    createFastHash,
}) {

    return Object.freeze({
        handleRequest,
        validateRequest,
    });

    //  This endpoint doesn't require authentication (no middleware), so 404 seems better than 401 at the first
    //  glance. Though, it isn't. Why? Because 404 indicates as if there no such endpoint to begin with.

    //  Why no authentication middleware for this endpoint? Because other auth endpoints also don't require
    //  authentication. So for consistency.

    function validateRequest(/**@type {HttpRequest}*/ httpRequest) {
        if (!httpRequest.cookies || Object.keys(httpRequest.cookies).length === 0 ||
            !httpRequest.cookies[NAME_OF_SESSION_COOKIE]) {
            return {
                isValid: false,
                httpErrorResponse: makeHttpError({
                    statusCode: 401,
                    error: "Please authenticate yourself first. Session cookie doesn't exist.",
                })
            };
        }
        if (httpRequest.cookies[NAME_OF_SESSION_COOKIE].length > 40) {
            return {
                isValid: false,
                httpErrorResponse: makeHttpError({
                    statusCode: 401,
                    error: "Please authenticate yourself first. Session cookie is invalid.",
                })
            };
        }
        return { isValid: true };
    }

    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {
        const plainSessionId = httpRequest.cookies[NAME_OF_SESSION_COOKIE];
        // the name reminds us not to save it directly inside server.

        const hashedSessionId = createFastHash(plainSessionId);
        const session = await find_from_sessions_by_hashedSessionId({ hashedSessionId });

        if (!session) {
            return makeHttpError({
                statusCode: 401,
                error: "Please authenticate yourself first. Session cookie is invalid.",
            });
        }
        return {
            headers: {
                "Content-Type": "application/json",
                // Crucial to set correct cache-control.
                "Cache-Control": "no-store",
            },
            statusCode: 200,
            payload: JSON.stringify({ success: true, userId: session.userId }),
        };
    }
}


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 */
