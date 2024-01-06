/** maximum time (stacked) reveal animations can take, so that the user doesn't get bored. */
const MAX_ANIMATION_TIME = 300;
window.MAX_ANIMATION_TIME = MAX_ANIMATION_TIME; // make it public

export function onMenuToggleClick() {
    const menu = /**@type {HTMLElement}*/(document.querySelector("nav[aria-label='Main Menu']"));
    if (menu.classList.contains("active")) {
        toggleRevealOfMenu(false);
        toggleRevealOfPageElements(true);
    }
    else {
        toggleRevealOfPageElements(false);
        toggleRevealOfMenu(true);
    }
}

/**
 * @description
 * @param {boolean} active - whether to reveal or hide.
 * @param {string} [selector] - Primarily designed for pages where some of inner elements
 * already have "active" class, but some other elements don't have and we want to display
 * reveal/hide animation only for those.
 */
export function toggleRevealOfPageElements(active, selector = "") {
    // We need to make an array (using [...]), so that we can use index in forEach callback.
    const elementsOfInterest = /**@type {HTMLElement[]}*/
        ([...(document.querySelectorAll("#page .to-reveal" + selector))]);

    elementsOfInterest.forEach((el, i) => {
        //  We wrap it inside setTimeout so that elements reveal/hide one-by-one instead of all at once.
        //  You can remove setTimeout if you'd like to reveal/hide all at once.
        setTimeout(() => {
            toggleReveal(el, active);
        }, Math.min(MAX_ANIMATION_TIME, i * 30));
    });
}


/** @param {boolean} active  */
export function toggleRevealOfMenu(active) {
    const menu = /**@type {HTMLElement}*/(document.querySelector("nav[aria-label='Main Menu']"));
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));
    const page = /**@type {HTMLElement}*/(document.querySelector("#page"));

    const menuElementsToReveal = /**@type {HTMLElement[]}*/
        ([...(document.querySelectorAll("nav[aria-label='Main Menu'] .to-reveal"))]);

    menuElementsToReveal.forEach(el => toggleReveal(el, active));
    menuToggle.setAttribute("aria-expanded", active ? "true" : "false");
    menu.setAttribute("aria-hidden", active ? "false" : "true");
    menu.classList.toggle("active", /*force=*/active);

    page.setAttribute("aria-hidden", active ? "true" : "false");
}

/** @param {HTMLElement} el  @param {boolean} active  */
function toggleReveal(el, active) {
    if (active) {
        el.classList.add("active");
    }
    else {
        el.classList.remove("active");
    }
}

