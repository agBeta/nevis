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

    return async (/** @type ExpressRequest */ req, /** @type ExpressResponse */ res) => {
        const httpRequest = adaptRequest(req);
        try {
            console.log(httpRequest);
            const httpResponse = await controller(httpRequest);
            console.log(httpResponse);

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

    /**
     * Return extracted useful information from an Express request.
     * @param {ExpressRequest} req
     * @returns {HttpRequest} httpRequest
     */
    function adaptRequest(req) {
        return Object.freeze({
            path: req.path,
            method: req.method,

            // e.g. we hit /user/10 (pattern /user/:id) pathParams will be {id: '10'}
            pathParams: req.params,
            // e.g. we hit /user?name=John&page=2 queryParams will be {name: 'John', page: '2'}
            queryParams: req.query,

            body: req.body,

            /*  See following links:
                    http://expressjs.com/en/4x/api.html#res.cookie
                    http://expressjs.com/en/4x/api.html#req.cookies
                    http://expressjs.com/en/resources/middleware/cookie-parser.html
                    https://stackoverflow.com/a/40135050.
            */
            cookies: req.cookies,

            headers: {
                "Content-Type": req.get("Content-Type"),
                "Referer": req.get("referer"),
                "User-Agent": req.get("User-Agent")
                //  You can also write something like ->  "token": req.headers["X-API-KEY".toLowerCase()]
            },

            /*  For more information you can see the following links:
                http://expressjs.com/en/4x/api.html#req.ip
                http://expressjs.com/en/4x/api.html#req.originalUrl
                Also for ip, see https://stackoverflow.com/a/33790357.
            */
            ip: req.ip,
            originalUrl: req.originalUrl
        });

    }
}

