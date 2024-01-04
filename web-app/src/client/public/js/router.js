/**
 * @param {{ routes: Array<{path: string, pageView: PageView}> }} param0
 * @returns
 */
export default function makeRouter({
    routes
}){
    return Object.freeze({
        navigateTo,
    });

    /** @param {string} routeToNavigate @param {boolean} [addToHistory] */
    function navigateTo(routeToNavigate, addToHistory=true) {
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
    // Javascript strings are immutable, so don't worry about mutating routeToNavigate.
    let r = routeToNavigate;
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
    return routeToNavigate.match(regex);
}

//  Credit to:
//  https://github.com/dcode-youtube/single-page-app-vanilla-js/tree/master.
//  https://github.com/firtman/coffeemasters-pwa/tree/main.

/**
 * @typedef {import("./types.d.ts").PageView} PageView
 */
