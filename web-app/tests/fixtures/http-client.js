import { Client } from "undici";
import makeFetchCookie from "fetch-cookie";

const fetchCookie = makeFetchCookie(fetch, new makeFetchCookie.toughCookie.CookieJar(undefined, {
    allowSpecialUseDomain: true,
    prefixSecurity: "strict"
}));

/**
 * @param {{ port: number }} props
 */
export default function makeHttpClient({ port }) {
    if (!port) {
        throw new Error("port is undefined or null.");
    }
    const BASE_URL = `http://localhost:${port}`;
    const client = new Client(BASE_URL);
    let data = []

    return Object.freeze({
        postRequest,
        getRequest,
    });

    function postRequest(/**@type {string}*/ url, /**@type {any}*/ body) {
        if (!url) {
            throw new Error("postRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("postRequest url must start with slash(/).");
        }
        data = [];
        // https://github.com/nodejs/undici/blob/main/docs/api/Dispatcher.md#example-3---dispatch-post-request
        return client.dispatch({
            method: "POST",
            // Headers are crucial. Never omit them.
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
            path: url,
        }, {
            onConnect: () => {
                console.log('Connected!')
            },
            onError: (error) => {
                console.error(error)
            },
            onHeaders: (statusCode, headers) => {
                console.log(`onHeaders | statusCode: ${statusCode} | headers: ${headers}`)
            },
            onData: (chunk) => {
                console.log('onData: chunk received')
                data.push(chunk)
            },
            onComplete: (trailers) => {
                console.log(`onComplete | trailers: ${trailers}`)
                const res = Buffer.concat(data).toString('utf8');
                console.log(`Response Data: ${res}`);
            }
        });
    }

    async function getRequest(/**@type {string}*/ url) {
        if (!url) {
            throw new Error("getRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("getRequest url must start with slash(/).");
        }
        const {
            statusCode,
            headers,
            trailers,
            body
        } = await client.request({
            path: url,
            method: 'GET',
        });

        console.log('response received', statusCode)
        console.log('headers', headers)

        for await (const data of body) {
            console.log('data', data)
        }

        console.log('trailers', trailers)
    }
}


// https://github.com/valeriangalliat/fetch-cookie/issues/67
// https://stackoverflow.com/a/70591228
// https://github.com/whatwg/fetch/issues/1384#issuecomment-1043684795
// https://stackoverflow.com/questions/57900595/how-to-send-custom-cookies-in-a-fetch-request
