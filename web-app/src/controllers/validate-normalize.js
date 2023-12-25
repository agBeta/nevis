import makeHttpError from "./http-error.js";


/**
 * Creates a "synchronous" function that validates httpRequest based on given schema. The created function returns
 * 400 or 404 http error response & {isValid: false} if validation fails.
 * If validation succeeds it may mutate httpRequest object to its normalized values.
 *
 * @see comment below the file.
 * @param {{
 *      schemaOfPathParams?: JoiObjectSchema,
 *      schemaOfBody?: JoiObjectSchema,
*       schemaOfQueryParams?: JoiObjectSchema,
 * }} param0
 */
export default function makeBasicValidateNormalize({ schemaOfBody, schemaOfPathParams, schemaOfQueryParams }) {

    return function (/** @type HttpRequest */ httpRequest) {

        if (schemaOfPathParams) {
            const { value: normalized, error } = schemaOfPathParams.validate(
                httpRequest.pathParams,
                { abortEarly: true, convert: true }
            );
            if (error) {
                return {
                    isValid: false,
                    httpErrorResponse: makeHttpError({
                        //  404 is semantically the best choice, for all GET and POST requests as well as PUT action
                        //  requests. Basically it says, there is no such endpoint to begin with.
                        //  Read more about this reasoning in REST.md from self-documentation.
                        statusCode: 404,
                        error: "Not found.",
                    })
                };
            }
            httpRequest.pathParams = normalized;
        }

        if (schemaOfQueryParams) {
            const { value: normalized, error } = schemaOfQueryParams.validate(
                httpRequest.queryParams,
                { abortEarly: true, convert: true }
            );
            if (error){
                return {
                    isValid: false,
                    httpErrorResponse: makeHttpError({
                        // The route exists, so 404 isn't correct. 400 is better.
                        statusCode: 400,
                        error: "Bad request. Invalid query parameters.",
                    })
                };
            }
            httpRequest.queryParams = normalized;
        }

        if (schemaOfBody) {
            const { value: normalized, error } = schemaOfBody.validate(
                httpRequest.body,
                { abortEarly: true, convert: true }
            );
            if (error) {
                return {
                    isValid: false,
                    httpErrorResponse: makeHttpError({
                        statusCode: 400,
                        error: "Bad request: " + error.message,
                    })
                };
            }
            httpRequest.body = normalized;
        }

        //  Henceforth, we can assume path params and body properties aren't fundamentally wrong or malicious for
        //  the request route, e.g. if the route needs postId, then we know for sure, postId isn't null/undefined or
        //  some very long string or risky (i.e. won't cause slow down in downstream parties or slow regex matching, etc.).
        //  Also read comment at the of the file.

        return { isValid: true };
    };
}

/**
 * NOTE: As the name suggests, it may not be the ultimate validation process of your endpoint controller. You may want
 * to further validate the normalized httpRequest by querying the db inside handleRequest function. In other words, this
 * basic validation only guarantees the incoming request is very unlikely to crash/hack your server or database, etc.
 */

/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("joi").ObjectSchema} JoiObjectSchema
 */
