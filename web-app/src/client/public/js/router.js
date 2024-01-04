/**
 * @param {{ routes: Array<{path: string, pageView: PageView}> }} param0
 * @returns
 */
export default function makeRouter({
    routes
}) {
    return Object.freeze({
        navigateTo,
    });

    /** @param {string} routeToNavigate @param {boolean} [addToHistory] */
    function navigateTo(routeToNavigate, addToHistory = true) {
        if (addToHistory) {
            //  We push state as { route } (instead of route), since we may add more things it.
            //  Be careful, there might be a size limit on the serialized representation of a [state] object.
            //  See https://developer.mozilla.org/en-US/docs/Web/API/History/pushState.
            history.pushState({ route: routeToNavigate }, "", routeToNavigate);
        }
        document.querySelectorAll("section.page").forEach(panel /*i.e. page*/ => {
            panel.setAttribute("aria-hidden", "false");
        });
        // const
    }



}



/**
 * @param {string} pathPattern an Express-like path, e.g. /posts/:id
 * @param {string} routeToNavigate
 */
export function matchAndCapture(pathPattern, routeToNavigate) {
    //  See tests for router to understand what this function does.

    // Javascript strings are immutable, so don't worry about mutating routeToNavigate.
    if (routeToNavigate !== "/" && routeToNavigate.endsWith("/")) {
        // Remove trailing slash. Trailing slash makes it difficult when we have query parameters and regex.
        routeToNavigate = routeToNavigate.slice(0, -1);
    }
    // routeToNavigate will have at most one question mark.
    const qIndex = routeToNavigate.lastIndexOf("?");
    if (qIndex !== -1) {
        routeToNavigate = routeToNavigate.slice(0, qIndex);
    }

    //  BTW, it's always safer create brand new regex based on path. It also helps avoiding maintain state
    //  between calls.
    //  See https://stackoverflow.com/questions/4688518/why-does-javascripts-regexp-maintain-state-between-calls.

    // See router.test.js to learn more about this Regex.
    const regex = new RegExp("^" + pathPattern.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");
    const result = routeToNavigate.match(regex);
    if (result == null) {
        return null;
    }

    const values = result.slice(1);
    //  NOTE: By design of our regex, if pathPattern is "/blog/:id", it will match "/blog/something/123"
    //  and will populate [params.id] with "something/123". By design of our API, we won't encounter such
    //  cases, So let's keep things simple and forget about these edge cases.

    // Now match every single parameter in pattern and return the parameter name (:id --> id)
    const keys = Array.from(/*matchAll returns IterableIterator, not array*/ pathPattern.matchAll(/:(\w+)/g))
        .map(function getOnlyTheKey(result) { return result[1]; });

    return Object.freeze({
        params: Object.fromEntries(keys.map((k, i) => [k, values[i]]))
    });
}

//  Credit to:
//  https://github.com/dcode-youtube/single-page-app-vanilla-js/tree/master.
//  https://github.com/firtman/coffeemasters-pwa/tree/main.

/**
 * @typedef {import("./types.d.ts").PageView} PageView
 */
