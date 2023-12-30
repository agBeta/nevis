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
        getRequest, clientCookies
    });

    async function postRequest(/**@type {string}*/ url, /**@type {any}*/ body) {
        if (!url) {
            throw new Error("postRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("postRequest url must start with slash(/).");
        }

        const raw = await fetch(BASE_URL + url, {
            method: "POST",
            // Headers are crucial. Never omit them.
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (raw.headers.getSetCookie().length > 0) {
            //  We use the same client in an entire test suite, in which we might login as different
            //  users. When response contains 'Set-Cookie' header, it means we must reset the cookies
            //  to their new values. Even though they might haven already been set by previous requests,
            //  they aren't valid anymore, since we are now logged in as another user (i.e. session is
            //  changed).
            clientCookies = [];
            for (let coo of raw.headers.getSetCookie()) {
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
        return raw/*.clone()?*/;
    }


    async function getRequest(/**@type {string}*/ url) {
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
                let chunks = [];
                // console.log("Status Code:", res.statusCode);
                res.on("data", chunk => {
                    chunks.push(chunk);
                });
                res.on("end", () => {
                    // console.log("Response ended: ");
                    // console.log(response);
                    const response = JSON.parse(Buffer.concat(chunks).toString());
                    resolve(response);
                });
            });
            // We could have chained [.on(..)] on http.get(..).
            req.on("error", (err) => {
                reject(err);
            });
        });
    }


    // from lib file
    // const options = {
    //        hostname: 'www.google.com',
    //        port: 80,
    //        path: '/upload',
    //        method: 'POST',
    //        headers: {
    //          'Content-Type': 'application/json',
    //          'Content-Length': Buffer.byteLength(postData),
    //        },
    //      };
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
