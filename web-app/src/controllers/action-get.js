import Joi from "joi";
import makeBasicValidateNormalize from "./validate-normalize.js";

/**
 * Creates a generic controller for any GET endpoint that ends in .../action/:actionId to return current status
 * of the action.
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
        // The function doesn't involve downstream parties. It should run quickly.

        return {
            headers: {
                "Content-Type": "application/json",
                // Probably the best place to use Location header, according to:
                // https://www.rfc-editor.org/rfc/rfc9110#section-10.2.2.
                "Location": httpRequest.path + `/action/${actionId}`
            },
            statusCode: 201,
            payload: JSON.stringify({ success: true, actionId })
        };
    }
}


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 */
