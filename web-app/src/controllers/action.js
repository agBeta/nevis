/**
 * Creates a function that generates a new action, and then returns the actionId as http response.
 * This helps us achieve idempotent POST, PUT and PATCH requests.
 * NOTE: We assume clients will behave responsibly. Otherwise the whole idea of introducing "action" concept would
 * be pointless.
 * See REST.md from self-documentation and sacrificing one round-trip.
 *
 * @version
 * 1.0 - In this simple version we don't cache or store generated actionId (hence no db/cache-related dependency is injected). But
 * we may do in future. Especially if it there is a valuable resource that only one action could be on done on
 * it (like ticket reservation). We can prevent race conditions by storing the actionId along with userId of the
 * client, and lock the resource, so that other users cannot get any actionId on the resource (though this could
 * also be done easily by database transactions and setting the correct isolation level, without introducing concept
 * of "action"). Anyway, this is just an idea in theory, and may have some flaws in its logic.
 *
 * @param {{ generateActionId: () => string }} param0
 */
export default function makeGenerateActionAndRespond({ generateActionId }) {

    // NOTE: The function doesn't involve downstream parties. It should run quickly.
    return function makeActionAndRespond(/**@type {import("#types").HttpRequest}*/ httpRequest) {
        const actionId = generateActionId();
        return {
            headers: {
                "Content-Type": "application/json",
                // Probably the best place to use Location header, according to:
                // https://www.rfc-editor.org/rfc/rfc9110#section-10.2.2.
                "Location": httpRequest.path + `/action/${actionId}`
            },
            statusCode: 201,
            payload: JSON.stringify({ success: true, actionId })
        };
    };
}
//
