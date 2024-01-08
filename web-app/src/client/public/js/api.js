const BASE_URL = (window.location.host.startsWith("localhost"))
    ? "http://" + window.location.host
    : "https://" + window.location.host;

/** @type {import("./types.d.ts").FetchBlogPaginated} */
export async function fetchBlogPaginated({ direction, cursor, limit }) {
    const url = new URL("/api/v1/blog/paginated", BASE_URL);
    url.searchParams.append("cursor", cursor);
    url.searchParams.append("direction", direction);
    url.searchParams.append("limit", limit + "");

    const request = new Request(url, {
        credentials: "omit", /* this endpoint doesn't require authentication */
        mode: "no-cors",
        method: "GET",
    });
    const raw = await fetch(request);

    const statusCode = raw.status;
    // You can be sure status 204 isn't returned so there will always be a "body".
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}

/** @type {import("./types.d.ts").FetchBlog} */
export async function fetchBlog({ blogId }) {
    const url = new URL(`/api/v1/blog/${blogId}`, BASE_URL);
    const request = new Request(url, {
        credentials: "omit",
        mode: "no-cors",
        method: "GET",
    });
    const raw = await fetch(request);
    const statusCode = raw.status;
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}

/** @type {import("./types.d.ts").PostEmailForCode} */
export async function postEmailForCode({ email, purpose }) {
    const url = new URL("/api/v1/auth/code", BASE_URL);
    const raw = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, purpose }),
    });
    const statusCode = raw.status;
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}

/** @type {import("./types.d.ts").PostSignup} */
export async function postSignup({ email, displayName, password, repeatPassword, birthYear, code }) {
    const url = new URL("/api/v1/auth/signup", BASE_URL);
    const raw = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, displayName, password, repeatPassword, birthYear, code }),
    });
    const statusCode = raw.status;
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}


/**@type {import("./types.d.ts").PostLogin} */
export async function postLogin({ email, password, rememberMe }) {
    const url = new URL("/api/v1/auth/login", BASE_URL);
    const raw = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
    });
    const statusCode = raw.status;
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}
//

