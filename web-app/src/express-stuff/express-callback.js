import adaptRequest from "./adapt-request.js";
/**
 * @typedef {import("#types").ExpressRequest} ExpressRequest
 * @typedef {import("#types").ExpressResponse} ExpressResponse
 * @typedef {import("../types").HttpRequest} HttpRequest
 * @typedef {import("#types").Controller} Controller
*/

/**
 * @param {Controller} controller
 * @returns {*} callback
 */
export default function makeExpressCallback(controller) {

    return async function (/** @type ExpressRequest */ req, /** @type ExpressResponse */ res) {
        const httpRequest = adaptRequest(req);
        try {
            const httpResponse = await controller(httpRequest);

            if (httpResponse.headers) {
                res.set(httpResponse.headers);
            }

            if (httpResponse.cookies) {
                // Do NOT use `for ... in` for Arrays. See https://stackoverflow.com/a/500531.
                httpResponse.cookies.forEach(cookie => {
                    res.cookie(cookie.name, cookie.value, cookie.options);
                });
            }
            res.status(httpResponse.statusCode).send(httpResponse.body);
        }
        catch (e) {
            /** @todo TODO log the error */
            res.status(500).json({ error: "An unknown error occurred on the server." });
        }
    };
}

