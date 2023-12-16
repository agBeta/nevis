/**
 * @param {{ port: number }} props
 */
export default function makeHttpClient({ port }) {
    if (!port) {
        throw new Error("port is undefined or null.");
    }
    const BASE_URL = `http://localhost:${port}`;

    return Object.freeze({
        postRequest
    });

    function postRequest(/** @type {string} */ url, /** @type {any} */ body) {
        if (!url) {
            throw new Error("postRequest must have a url.");
        }
        if (!url.startsWith("/")) {
            throw new Error("postRequest url must start with slash(/).");
        }
        return fetch(BASE_URL + url, {
            method: "POST",
            // Headers are crucial. Never omit them.
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
    }
}
