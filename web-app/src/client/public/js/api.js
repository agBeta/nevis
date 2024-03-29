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


/**@type {import("./types.d.ts").PostLogout} */
export async function postLogout(){
    const url = new URL("/api/v1/auth/logout", BASE_URL);
    const raw = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
    });
    const statusCode = raw.status;
    if (statusCode !== 200) {
        // We must throw an error (i.e. reject), since we probably want to retry. Also see makeRetry in utils.
        throw new Error("Failed to logout: Error " + statusCode);
    }
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}


/**@type {import("./types.d.ts").RequestNewAction} */
export async function requestNewAction(purpose){
    const url = new URL("/api/v1" +  (purpose === "add-blog" ? "/blog" : ""), BASE_URL);
    const raw = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        mode: "no-cors",
    });
    const statusCode = raw.status;
    const body = await raw.json();
    if (statusCode !== 201) {
        throw new Error("Failed to obtain an action: " + statusCode + " " + body?.error);
    }
    return {
        statusCode,
        actionId: statusCode === 201 ? body.actionId : null,
    };
}


/**@type {import("./types.d.ts").PostBlog} */
export async function postBlog({
    blogTitle, blogBody, blogTopic, imageUrl, actionId
}){
    console.log(actionId);
    const url = new URL("/api/v1/blog/action/" + actionId, BASE_URL);
    const request = new Request(url, {
        method: "PUT",
        // We must use cors, PUT is unsupported in no-cors mode.
        mode: "cors",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            blogTitle, blogBody, blogTopic: blogTopic ??  "Technology"
        }),
    });
    const raw = await fetch(request);
    const statusCode = raw.status;
    const body = await raw.json();
    if (statusCode !== 201) {
        // We must throw an error (i.e. reject), since we want to retry.
        throw new Error("Failed to post new blog: " + statusCode + " " + body?.error);
    }
    return {
        statusCode,
        blogId: statusCode === 201 ? body.blogId : null,
    };
}
//

