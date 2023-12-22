/**
 * Creates a generic controller to handle action creation on any endpoint.
 * @param {{ generateActionId: () => string }} param0
 * @version 1.0 comments below this file
 */
export function makeEndpointController({ generateActionId }) {

    return Object.freeze({
        handleRequest,
        validateRequest: () => ({ isValid: true })
    });

    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {
        // The function doesn't involve downstream parties. It should run quickly.

        const actionId = generateActionId();
        return {
            headers: {
                "Content-Type": "application/json",
                // Probably the best place to use Location header, according to https://www.rfc-editor.org/rfc/rfc9110#section-10.2.2.
                "Location": httpRequest.path + `/action/${actionId}`
            },
            statusCode: 201,
            payload: JSON.stringify({ success: true, actionId })
        };
    }
}


/**
 * In future, we may decide to assign specific controller, which is fine-designed based on the endpoint (e.g. not
 * allowing action for some resource based on httpRequest userId, path, etc.).
 *
 * In current version we don't cache or store generated actionId (hence no db/cache-related dependency
 * is injected). But we may do in future. Especially if it there is a valuable resource that only one action
 * could be on done on it (like ticket reservation). We can prevent race conditions by storing the actionId along
 * with userId of the client, and lock the resource, so that other users cannot get any actionId on the resource
 * (though this could also be done easily by database transactions and setting the correct isolation level, without
 * introducing concept of "action"). Anyway, this is just an idea in theory, and may have some flaws in its logic.
 */


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 */

