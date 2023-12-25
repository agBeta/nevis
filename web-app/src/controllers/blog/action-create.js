import makeHttpError from "../http-error.js";
import CONSTANTS from "../constants.js";

/**
 * @param {*} param0
 * @returns {Controller}
 */
export function makeEndpointController({
    generateFastId,
    count_actions_by_userId,
    insert_action,
}) {
    return Object.freeze({
        validateRequest,
        handleRequest,
    });


    /** @returns {Promise<HttpResponse>} */
    async function handleRequest(/**@type {AuthenticatedHttpRequest}*/ httpRequest) {
        const userId = httpRequest.userId;
        // See below (insert_action) to find out what exactly does "few hours" mean.
        const cnt_within_last_few_hours = await count_actions_by_userId({ userId, purpose: "blog:post" });

        if (cnt_within_last_few_hours > 10) {
            return {
                statusCode: 429,
                headers: {
                    "Content-Type": "application/json",
                    "Retry-After": "3600" /*not accurate at all, but fine*/,
                    "Cache-Control": "no-store", /*safer option, since we may dynamically set Retry-After in future*/
                },
                payload: JSON.stringify({
                    success: false,
                    error: "Too many requests. You cannot request any more fresh actions for blog post."
                }),
            };
        }

        const actionId = generateFastId();
        // It inserts action and updates other stuff in an atomic manner.
        await insert_action({
            actionId,
            purpose: "blog:post",
            userId,
            state: CONSTANTS.actionState.NOT_INITIATED,
            response: null,
            ttlInSeconds: 12 * 60 * 60
        });

        return {
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
                "Location": `/blog/action/${actionId}`,
                //  no-store is crucial, since user might want to publish two blogs roughly the same time. Especially happens
                //  if some background sync is being done by a PWA and user was disconnected while writing two blogs.
                //  Anyway, this is the safest directive.
                "Cache-Control": "no-store",
            },
            payload: JSON.stringify({ success: true, actionId })
        };
    }

    function validateRequest(/**@type {AuthenticatedHttpRequest}*/ httpRequest) {
        //  Assuming the user is authenticated (passed through requireAuthentication middleware) there
        //  isn't any basic synchronous validation we want to do here.
        return { isValid: true };
    }
}

/**
 * @typedef {import("#types").AuthenticatedHttpRequest} AuthenticatedHttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 */
