import makeHttpError from "#utils/http-error.js";

/**
 * @param {{ verificationService: VerificationService }} services
 * @returns {Controller}
 */
export function makeEndpointController({ verificationService }) {

    return function handleRequest(/** @type HttpRequest */ httpRequest) {
        switch (httpRequest.method) {
            case "POST":
                return handlePost(httpRequest);
            default:
                return makeHttpError({ statusCode: 405, error: `${httpRequest.method} is not allowed.` });
        }
    };


    /** @type {Handler} */
    async function handlePost(httpRequest) {
    }
}

/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller

 * @typedef {import("#types").VerificationService} VerificationService
 */
