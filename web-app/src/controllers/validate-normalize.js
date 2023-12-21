import makeHttpError from "./http-error.js";


/**
 * Creates a "synchronous" function that validates httpRequest based on given schema. The created function returns
 * 400 http error response & {isValid: false} if validation fails.
 * If validation succeeds it may mutate httpRequest object to its normalized values.
 *
 * NOTE: As the name suggests, it may not be the ultimate validation process of your endpoint controller. You may want
 * to further validate the normalized httpRequest by querying the db inside handleRequest function.
 * In other words, this basic validation only guarantees the incoming request is very unlikely to crash/hack your server
 * or database, etc.
 *
 * @param {{
 *      schemaOfBody?: JoiObjectSchema,
 *      schemaOfPathParams?: JoiObjectSchema,
 * }} param0
 */
export default function makeBasicValidateNormalize({ schemaOfBody, schemaOfPathParams }) {

    return function (/** @type HttpRequest */ httpRequest) {
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
                        error: "Bad request: " + error.message
                    })
                };
            }
            httpRequest.body = normalized;
        }

        if (schemaOfPathParams) {
            const { value: normalized, error } = schemaOfPathParams.validate(
                httpRequest.pathParams,
                { abortEarly: true, convert: true }
            );
            if (error) {
                return {
                    isValid: false,
                    httpErrorResponse: httpRequest.method.toUpperCase() === "GET"
                        ? makeHttpError({ statusCode: 404, error: "Not found." })
                        : makeHttpError({
                            statusCode: 422,
                            error: "Unprocessable Entity: path parameters do not correspond to any resource or action."
                        })
                };
            }
            httpRequest.pathParams = normalized;
        }

        //  Henceforth, we can assume path params aren't fundamentally wrong or malicious for the request route,
        //  e.g. if the route needs postId, then we know for sure, postId isn't null/undefined or too long string
        //  or risky (i.e. won't cause slow down in downstream parties or slow regex matching, etc.).
        //  Same for request body.
        
        return { isValid: true };
    };
}

/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("joi").ObjectSchema} JoiObjectSchema
 */
