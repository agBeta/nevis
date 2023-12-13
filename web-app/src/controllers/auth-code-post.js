import makeHttpError from "#utils/http-error.js";
import Joi from "joi";

/**
 * @param {{ codeService: CodeService }} injections
 * @returns {Controller}
 */
export function makeEndpointController({ codeService }) {

    // In order to prevent object creation overhead, declare schema here, not inside validateRequest.
    const schema = Joi.object({
        email: Joi.string().email().max(80).required()
    });

    return Object.freeze({
        handleRequest,
        validateRequest
    });


    async function handleRequest(/** @type HttpRequest */ httpRequest) {
        // @ts-ignore
        const /** @type {string} */ email = httpRequest.body.email;

        /** @todo TODO idempotent */

        const code = await codeService.generateCode();
        console.log(code);
        await codeService.storeInDbAndSendCode(email, code);
        return {
            headers: { "Content-Type": "application/json" },
            statusCode: 201,
            payload: JSON.stringify({ success: true })
        };
    }

    function validateRequest(/** @type HttpRequest */ httpRequest) {
        const { value: normalized, error } = schema.validate(httpRequest.body, { abortEarly: true });
        if (error) {
            return {
                isValid: false,
                httpErrorResponse: makeHttpError({ statusCode: 400, error: "Bad request: " + error.message })
            };
        }
        httpRequest.body = normalized;
        return { isValid: true };
    }
}

/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 * @typedef {import("#types").CodeService} CodeService
 */
