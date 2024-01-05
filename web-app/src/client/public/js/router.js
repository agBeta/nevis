/** @param {{ routes: Array<{path: string, pageView: PageView}> }} param0 */
export default function makeRouter({ routes }) {

    return Object.freeze({
        init,
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
        document.querySelectorAll("section.page").forEach(page => {
            page.setAttribute("aria-hidden", "true");
        });


        let matchingRoute = null;
        let params = null;

        for (const r of routes) {
            const result = matchAndCapture(r.path, routeToNavigate);
            if (result == null) continue;
            matchingRoute = r;
            params = result.params;
            // The first one whose pattern matches the routeToNavigate will be rendered. We don't continue anymore.
            break;
        }
        if (!matchingRoute) {
            // By convention, the last element should correspond to 404/crash page.
            matchingRoute = routes[routes.length - 1];
            params = null;
        }
        window.SMI.setCurrentViewOnScreen(matchingRoute.pageView.NAME);
        matchingRoute.pageView.render(params); // an async function
    }


    function init() {
        //  Don't add eventListener just to links. Because we may later add/remove new links to the page.
        //  The best way is to attach our listener body click event.
        document.body.addEventListener("click", (ev) => {
            // @ts-ignore
            if (ev.target.matches("[data-link]")) {
                // We aren't letting the browser take care of navigation, since we want to do it by our router, so...
                ev.preventDefault();
                navigateTo(/**@type {HTMLAnchorElement}*/(ev.target).href, true);
            }
        });

        window.addEventListener("popstate", ev => {
            navigateTo(ev.state.route, false/*<--*/);
        });

        // Now listeners are registered, and we just need to take care of initial url
        navigateTo(window.location.pathname);
    }
}


/** @param {string} pathPattern an Express-like path, e.g. /posts/:id  @param {string} routeToNavigate */
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
