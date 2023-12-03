/**
     * Return extracted useful information from an Express request.
     * @param {ExpressRequest} req
     * @returns {HttpRequest} httpRequest
     */
export default function adaptRequest(req) {
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

/**
 * @typedef {import("#types").ExpressRequest} ExpressRequest
 * @typedef {import("../types").HttpRequest} HttpRequest
 */
