import Joi from "joi";
import makeBasicValidateNormalize from "./validate-normalize.js";
import makeHttpError from "./http-error.js";

/**
 * Creates a generic controller for any GET endpoint that ends in .../action/:actionId to return current status
 * of the action.
 * @returns {Controller}
 */
export function makeEndpointController({ find_action_by_id }) {

    return Object.freeze({
        handleRequest,
        validateRequest: makeBasicValidateNormalize({
            schemaOfPathParams: Joi.object({
                actionId: Joi.string().min(10).max(50)
            })
        })
    });

    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {
        const action = await find_action_by_id(httpRequest.pathParams.actionId);

        if (!action) {
            return makeHttpError({ statusCode: 404, error: "Not found." });
        }

        if (action.currentState === "processing") {
            const payload = {
                currentState: action.currentState,
                expectedToCompleteBefore: action.expectedToCompleteBefore ?? null,
            };
            return {
                //  202 isn't cached by default (see https://developer.mozilla.org/en-US/docs/Glossary/Cacheable)
                //  but just in case.
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
                statusCode: 202,
                payload: JSON.stringify(payload)
            };
        }
        else {
            const payload = {
                currentState: "done",
            };
            return {
                headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                },
                statusCode: 200,
                payload: JSON.stringify(payload)
            };
        }

    }
}


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").Controller} Controller
 */
