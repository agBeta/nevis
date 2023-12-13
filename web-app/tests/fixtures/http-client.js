const PORT = process.env.PORT;
const BASE_URL = `http://localhost:${PORT}`;

export function postRequest(/** @type {string} */ url, /** @type {any} */ body) {
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
