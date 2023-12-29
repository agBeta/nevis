

/**
 * @param {{ port: number }} props
 */
export default function makeHttpClient({ port }) {
    if (!port) {
        throw new Error("port is undefined or null.");
    }
    const BASE_URL = `http://localhost:${port}`;
    let /**@type {{ [key: string]: string }}*/ persistCookieHeaders = {};

    return Object.freeze({
        postRequest,
        getRequest,
    });

    function postRequest(/**@type {string}*/ url, /**@type {any}*/ body, persistCookies=false) {
        if (!url) {
            throw new Error("postRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("postRequest url must start with slash(/).");
        }
        if (!persistCookies) {
            return fetch(BASE_URL + url, {
                method: "POST",
                // Headers are crucial. Never omit them.
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
        } else {
            return fetch(BASE_URL + url, {
                method: "POST",
                // Headers are crucial. Never omit them.
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            }).then(raw => {
                const cookies = raw.headers.getSetCookie();
                for (let c of cookies){
                    const cookieNameAndValue = c.split(";")[0];
                    const [name, value] = cookieNameAndValue.split("=");
                    persistCookieHeaders[name] = value;
                }
                console.log(persistCookieHeaders);
                return raw;
            });
        }
    }

    function getRequest(/**@type {string}*/ url) {
        if (!url) {
            throw new Error("getRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("getRequest url must start with slash(/).");
        }

        const opts = {
            method: "GET",
            credentials: "same-origin",
        };
        console.log('------- persist cookie header ---------');
        console.log(persistCookieHeaders);
        if (Object.keys(persistCookieHeaders).length > 0) {
            opts.headers = {
                'Cookie': '__Host-nevis_session_id=' + persistCookieHeaders['__Host-nevis_session_id']
            };
        }
        console.log(opts);
        // @ts-ignore
        return fetch(BASE_URL + url, opts);
    }
}


// https://github.com/valeriangalliat/fetch-cookie/issues/67
// https://stackoverflow.com/a/70591228
// https://stackoverflow.com/questions/57900595/how-to-send-custom-cookies-in-a-fetch-request
