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
    // You can be sure status 204 isn't returned so there must be a body.
    const body = await raw.json();
    return {
        statusCode,
        body,
    };
}

