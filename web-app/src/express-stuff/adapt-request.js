/**
     * Return extracted useful information from an Express request.
     * @param {ExpressRequest} req
     * @returns {HttpRequest} httpRequest
     */
export default function adaptRequest(req) {
    const adapted = {};
    // We cannot use Object.freeze(), since we may set "body" to normalized down the road inside request validation
    // process. So defineProperties is the only choice to have highest integrity possible.
    // According to MDN: configurable, enumerable and writable default to false.

    Object.defineProperties(adapted, {
        path: { value: req.path },
        method: { value: req.method },
        // e.g. we hit /user/10 (pattern /user/:id) pathParams will be {id: '10'}
        pathParams: { value: req.params },
        // e.g. we hit /user?name=John&page=2 queryParams will be {name: 'John', page: '2'}
        queryParams: { value: req.query },

        // See following links:
        //   http://expressjs.com/en/4x/api.html#res.cookie
        //   http://expressjs.com/en/4x/api.html#req.cookies
        //   http://expressjs.com/en/resources/middleware/cookie-parser.html
        //   https://stackoverflow.com/a/40135050.
        cookies: { value: req.cookies, },

        headers: {
            value: Object.freeze({
                "Content-Type": req.get("Content-Type"),
                "Referer": req.get("referer"),
                "User-Agent": req.get("User-Agent")
                //  You can also write something like ->  "token": req.headers["X-API-KEY".toLowerCase()]
            })
        },

        /*  For more information you can see the following links:
            http://expressjs.com/en/4x/api.html#req.ip
            http://expressjs.com/en/4x/api.html#req.originalUrl
            Also for ip, see https://stackoverflow.com/a/33790357.
        */
        ip: { value: req.ip, },
        originalUrl: { value: req.originalUrl },


        body: {
            value: req.body,
            configurable: false,
            // This one differs from other properties.
            writable: true
        }
    });

    /** @todo TODO find some workaround for this */
    // @ts-ignore
    return adapted;
}

/**
 * @typedef {import("#types").ExpressRequest} ExpressRequest
 * @typedef {import("../types").HttpRequest} HttpRequest
 */
