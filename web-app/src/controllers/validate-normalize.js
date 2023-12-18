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
 * @param {{ schemaOfBody?: JoiObjectSchema }} param0
 */
export default function makeBasicValidateNormalize({ schemaOfBody }) {

    return function (/** @type HttpRequest */ httpRequest) {
        if (schemaOfBody) {
            const { value: normalized, error } = schemaOfBody.validate(httpRequest.body, { abortEarly: true });
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
        return { isValid: true };
    };
}

/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("joi").ObjectSchema} JoiObjectSchema
 */
