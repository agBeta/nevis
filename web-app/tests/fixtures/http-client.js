import makeFetchCookie from "fetch-cookie";
import http from "node:http";

/**
 * @param {{ port: number }} props
 */
export default function makeHttpClient({ port }) {
    if (!port) {
        throw new Error("port is undefined or null.");
    }
    const BASE_URL = `http://localhost:${port}`;

    // https://github.com/salesforce/tough-cookie?tab=readme-ov-file#cookiejarstore-options
    const cookieJar = new makeFetchCookie.toughCookie.CookieJar(
        // https://github.com/salesforce/tough-cookie?tab=readme-ov-file#store
        undefined,
        { allowSpecialUseDomain: true, prefixSecurity: "strict" }
    );
    const fetchCookie = makeFetchCookie(fetch, cookieJar);

    return Object.freeze({
        postRequest,
        getRequest,
        get,
    });

    async function postRequest(/**@type {string}*/ url, /**@type {any}*/ body) {
        if (!url) {
            throw new Error("postRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("postRequest url must start with slash(/).");
        }
        const raw = await fetchCookie(BASE_URL + url, {
            method: "POST",
            // Headers are crucial. Never omit them.
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        for (let coo of raw.headers.getSetCookie()) {
            //  We must add "Secure" when a cookie has __Host- prefix. Otherwise toughCookie will throw
            //  an error. See https://github.com/salesforce/tough-cookie?tab=readme-ov-file#cookie-prefixes.
            //  Recall, the server (i.e. login controller) won't set secure option for cookies when
            //  NODE_ENV=test.
            // coo += "; Secure";
            // console.log(coo);
            await cookieJar.setCookie(coo, BASE_URL); // ---> not working correctly. don't know why?
        }
        cookieJar.setCookie(raw.headers.getSetCookie()[0].split(";")[0], BASE_URL);
        cookieJar.setCookie(raw.headers.getSetCookie()[1].split(";")[0], BASE_URL);
        cookieJar.setCookie("foo=base", BASE_URL + url);
        // console.log(cookieJar.getCookiesSync(BASE_URL));
        return raw.clone();
    }


    async function getRequest(/**@type {string}*/ url) {
        if (!url) {
            throw new Error("getRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("getRequest url must start with slash(/).");
        }
        // console.log(" cookies in getRequest ", " 🗒️ ".repeat(10));
        // console.log(cookieJar.getCookiesSync(BASE_URL + url));
        const raw = await fetchCookie(BASE_URL + url);
        return raw.clone();
    }

    async function get(url) {
        // path --> http.get (RequestOptions, ...) --> RequestOptions --> ClientRequestArgs
        //  --> headers?: OutgoingHttpHeaders | undefined;  --> OutgoingHttpHeaders
        //  --> cookie?: string | string[] | undefined;
        const opts = {
            hostname: "localhost",
            port: port,
            path: url,
            agent: false,
            headers: {
                "set-cookie": "foo=bar; path=/; max-age=30000; Secure",
                "cookie": ["baz=lar; you=are"],
            }
        };

        console.log(cookieJar.getCookiesSync(BASE_URL)[0]);

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


        // from https://blog.logrocket.com/5-ways-to-make-http-requests-in-node-js/
        // and https://stackoverflow.com/questions/52951091/how-to-use-async-await-with-https-post-request.
        return new Promise((resolve, reject) => {
            const req = http.get(opts, (res) => {
                let data = [];
                const headers = res.headers;
                console.log("Status Code:", res.statusCode);

                res.on("data", chunk => {
                    data.push(chunk);
                });

                res.on("end", () => {
                    console.log("Response ended: ");
                    const response = JSON.parse(Buffer.concat(data).toString());
                    console.log(response);
                    resolve(response);
                });
            });

            req.on("error", (err) => {
                reject(err);
            });


        });
    }

}


// https://github.com/valeriangalliat/fetch-cookie/issues/67
// https://stackoverflow.com/a/70591228
// https://github.com/whatwg/fetch/issues/1384#issuecomment-1043684795
// https://stackoverflow.com/questions/57900595/how-to-send-custom-cookies-in-a-fetch-request
