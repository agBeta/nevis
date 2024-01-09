/** @param {{ routes: Array<Route> }} param0 */
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

        let matchingRoute = null;
        let params = null;

        for (const r of routes) {
            const result = matchAndCapture(r.path, routeToNavigate);
            console.log(r.path, result);
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

        if (matchingRoute.guard) {
            const { canPrecede, redirectPathIfFailed } = matchingRoute.guard();
            if (!canPrecede) {
                navigateTo(redirectPathIfFailed, true);
                return;
            }
        }
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
                const url = new URL(/**@type {HTMLAnchorElement}*/(ev.target).href);
                // console.log("Here preventing default");
                navigateTo(url.pathname + url.search + url.hash, true);
            }
        });

        window.addEventListener("popstate", ev => {
            navigateTo(ev.state.route, false/*<--*/);
        });

        //  Now listeners are registered, and we just need to take care of initial url
        //  location.search will return empty string if there is no query string.
        const initialUrl = window.location.pathname + window.location.search + window.location.hash;
        //  Why addToHistory=false? See comment at the end of this file.
        navigateTo(initialUrl, false);
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
    // routeToNavigate will have at most one hash.
    const hIndex = routeToNavigate.lastIndexOf("#");
    if (hIndex !== -1) {
        // We don't store hash anywhere, since our application doesn't use it.
        routeToNavigate = routeToNavigate.slice(0, hIndex);
    }

    // routeToNavigate will have at most one question mark.
    const qIndex = routeToNavigate.lastIndexOf("?");
    if (qIndex !== -1) {
        //  Views that rely on query string will obtain their search params inside their render(..)
        //  function by accessing 'window.location.search' (e.g. obtainSearchParams in pages/blogs.js).
        //  So there's no need to store query string inside this function. No need to return it.
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


/* Why addToHistory=false in init()?
    If we use true, when the user types, say, /login into browser address bar and
    directly wants to navigate to login page, then another redundant history for "/"
    will be added. In other words, if user clicks back button, he won't go back to the
    previous, but to our web-app login page.
    Same happens when user directly (by typing into address bar) navigates from /login
    to, say, /blog/paginated; Another redundant history (for "/") will be added. So when
    the user clicks back button, the browser won't go to /login, but to "/" (home). This
    isn't what we want.
    You can witness this issue by setting addToHistory=true, and run login.spec.js e2e test
    in debug mode (and inspect browser history in between steps of the test).
 */


//  Credit to:
//  https://github.com/dcode-youtube/single-page-app-vanilla-js/tree/master.
//  https://github.com/firtman/coffeemasters-pwa/tree/main.

/**
 * @typedef {import("./types.d.ts").PageView} PageView
 * @typedef {import("./types.d.ts").Route} Route
 */
