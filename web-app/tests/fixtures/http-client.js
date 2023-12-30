// @ts-nocheck
import http from "node:http";

/**
 * @param {{ port: number }} props
 */
export default function makeHttpClient({ port }) {
    if (!port) {
        throw new Error("port is undefined or null.");
    }
    const BASE_URL = `http://localhost:${port}`;
    let /**@type {string[]}*/ clientCookies = [];

    return Object.freeze({
        postRequest,
        getRequest,
    });

    /**
     * @param {string} url
     * @param {any} body
     * @returns {Promise<{
     *      statusCode: number,
     *      headers: {
     *          [key: string]: string,
     *          get: (headerName:string)=>string|string[]|undefined,
     *          getSetCookie: ()=>string[]|undefined
     *      },
     *      response: any,
     * }>}
     */
    async function postRequest(url, body) {
        if (!url) {
            throw new Error("postRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("postRequest url must start with slash(/).");
        }

        const stringifiedBody = JSON.stringify(body);

        const /**@type {import("http").ClientRequestArgs}*/ options = {
            hostname: "localhost",
            port: port,
            path: url,
            protocol: "http:",
            method: "POST",
            headers: {
                // Content-Type is crucial. Never omit it.
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(stringifiedBody),
            },
        };
        if (clientCookies.length > 0) {
            // adding new property "cookie"
            options.headers["cookie"] = clientCookies.join("; ");
        }

        return new Promise((resolve, reject) => {
            const req = http.request(options, function handleResponseFromServer(res) {
                // IncomingMessage extends stream.Readable
                res.setEncoding("utf-8");

                // See getRequest for comments about the following two variables.
                const statusCode = res.statusCode ?? -99;
                let headers = res.headers;
                headers = {
                    ...headers,
                    get: function (/**@type{string}*/headerName) {
                        return this[headerName.toLowerCase()];
                    },
                    getSetCookie: function () {
                        return this["set-cookie"];
                    }
                };

                const chunks = [];
                res.on("data", (chunk) => {
                    chunks.push(chunk);
                });
                res.on("end", function constructFinalResponseJSON() {
                    // We know for sure the response data is an stringified json. So ...
                    const stringified = chunks.join("");
                    const response = JSON.parse(stringified);

                    //  Before resolving, we must take care of set-cookie headers (i.e. server sends
                    //  back a cookie to be set in client-side, like after login).
                    persistCookiesInClient(headers);

                    resolve(Object.freeze({ response, headers, statusCode }));
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            // Sending body...
            req.write(stringifiedBody, "utf-8", function (err) {
                if (err) reject("Failed to write body to stream. " + err.message);
            });
            req.end();
        });
    }


    /**
     * @param {string} url
     * @returns {Promise<{
     *      statusCode: number,
     *      headers: { [key: string]: string, get: (string)=>string|undefined },
     *      response: any,
     * }>}
     */
    async function getRequest(url) {
        if (!url) {
            throw new Error("getRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("getRequest url must start with slash(/).");
        }

        // How these options are found? See comment below end of file.

        let options = {
            hostname: "localhost",
            port: port,
            path: url,
            agent: false,
        };
        if (clientCookies.length > 0) {
            options = {
                ...options,
                headers: {
                    "cookie": clientCookies.join("; ")
                    //  It seems we can also set it by the array.
                },
            };
        }
        return new Promise((resolve, reject) => {
            const req = http.get(options, (res) => {
                const statusCode = res.statusCode /*just to prevent being undefined*/ - 99;
                // Key-value pairs of header names (in lower-case) and values
                let headers = res.headers ?? {};
                headers = {
                    ...headers,
                    //  Don't mix it up with "get" syntax that binds an object property to a function.
                    //  We add this function to have more compatibility between result of fetch API in
                    //  which we could use raw.headers.get("...")
                    get: function (/**@type{string}*/headerName) {
                        return this[headerName.toLowerCase()];
                    }
                };

                let chunks = [];
                res.on("data", chunk => {
                    chunks.push(chunk);
                });
                res.on("end", () => {
                    // console.log("Response ended: ");
                    // console.log(response);
                    const response = JSON.parse(Buffer.concat(chunks).toString());
                    resolve(Object.freeze({ response, headers, statusCode }));
                });
            });
            // We could have chained [.on(..)] on http.get(..).
            req.on("error", (err) => {
                reject(err);
            });
        });
    }



    /** @param {{ [key: string]: string, get: (string)=>string|undefined, getSetCookie: ()=>string[]|undefined}} headers */
    function persistCookiesInClient(headers) {
        if (!headers.getSetCookie() || headers.getSetCookie().length == 0) return;

        //  We use the same client in an entire test suite, in which we might login as different
        //  users. When response contains 'Set-Cookie' header, it means we must reset the cookies
        //  to their new values. Even though they might haven already been set by previous requests,
        //  they aren't valid anymore, since we are now logged in as another user (i.e. session is
        //  changed).
        clientCookies = [];
        for (let coo of headers.getSetCookie()) {
            //  We only need the name=value pert, to inject as 'cookie' in subsequent requests. Recall,
            //  there is a 'Set-Cookie' Response header and 'Cookie' Request header. For 'Cookie' header
            //  in request, we are only allowed to include name=value part (i.e. shouldn't include max-age,
            //  etc.).
            //  Also we don't care about Max-Age=.., path=.., etc. Though, we can implement expiration
            //  logic for clientCookies based on their max-age, but it we won't need this behavior in
            //  tests and will only complicate the code.
            const nameAndValuePart = coo.split(";")[0];
            clientCookies.push(nameAndValuePart);
        }
    }

}


/*
    The problem we faced was that, fetch doesn't allow us to set 'cookie' header as it is a
    forbidden header according to spec.
    Package fetch-cookie (https://github.com/valeriangalliat/fetch-cookie) also didn't work as
    expected (actually the problem was probably not using cookieParser on the server). Anyway
    these five consecutive commits represent the journey that led us to use native http module.
        c621aeee6c4, ..., b29139458ce04c93f1

    Those commits contain a (probably?) working implementation using fetchCookie.

    These links might be useful if you ever decide to use fetchCookie again:
        https://github.com/whatwg/fetch/issues/1384#issuecomment-1043684795.
        https://github.com/valeriangalliat/fetch-cookie/issues/67.
        https://stackoverflow.com/a/70591228.

    Another minor obstacle was that, tough-cookie doesn't let us set "__Host-..." cookies freely. The
    setCookie(..) was failing silently (without throwing error). This was solved though. Anyway read
    more on:
        https://github.com/salesforce/tough-cookie?tab=readme-ov-file#cookie-prefixes.
        https://github.com/salesforce/tough-cookie#cookiejarstore-options.
*/
/*
    Useful links for using http native modules
        https://blog.logrocket.com/5-ways-to-make-http-requests-in-node-js/.
        https://stackoverflow.com/questions/52951091/how-to-use-async-await-with-https-post-request.


    For finding [request]/[get] options related to http module:
        ctrl+click on http.get(..)
            --> vscode navigates to http.d.ts file from node_modules/@types/node
            --> See it accepts "RequestOptions" as first argument
            --> keep jumping by ctrl+click
            --> headers?: OutgoingHttpHeaders | undefined
            --> cookie?: string | string[] | undefined
 */
