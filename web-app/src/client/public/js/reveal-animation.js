/** maximum time reveal animation can take and shouldn't exceed it so that the user doesn't get bored. */
const MAX_ANIMATION_TIME = 300;
window.MAX_ANIMATION_TIME = MAX_ANIMATION_TIME; // make it public

export function onMenuToggleClick() {
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));
    const menu = /**@type {HTMLElement}*/(document.querySelector("nav[aria-label='Main Menu']"));

    const menuElementsToReveal = /**@type {HTMLElement[]}*/
        ([...(document.querySelectorAll("nav[aria-label='Main Menu'] .to-reveal"))]);

    if (menu.classList.contains("active")) {
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menu.classList.remove("active");
        menu.setAttribute("aria-hidden", "true");

        menuElementsToReveal.forEach(el => {
            //  If you want to reveal menu elements one-by-one wrap line inside a setTimeout. But let's keep
            //  things simple.
            toggleReveal(el, false);
        });
        toggleRevealOfPageElements(true, ":not(.nav-item)");
    }
    else {
        menuToggle.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        menu.classList.add("active");
        menu.setAttribute("aria-hidden", "false");

        toggleRevealOfPageElements(false, ":not(.nav-item)");
        menuElementsToReveal.forEach(el => {
            toggleReveal(el, true);
        });
    }
    //  You may also add aria-hidden="true" to nav-items for screen readers when menu isn't expanded. We didn't
    //  do that. Some useful links:
    //  https://www.linkedin.com/pulse/hiding-elements-from-screen-readers-girijesh-tripathi.
    //  https://snook.ca/archives/html_and_css/hiding-content-for-accessibility.
}

/**
 * @description
 * This will actually result in (re)displaying reveal animation on screen. Primarily designed for pages
 * where some of inner elements don't have "active" class and are going to be revealed now, like <li>s
 * of newly fetched blogs in blogsView.
 * @param {boolean} active - whether to reveal or hide.
 * @param {string} selector
 */
export function toggleRevealOfPageElements(active, selector) {
    // We need to make an array (using [...]), so that we can use index in forEach callback.
    const elementsOfInterest = /**@type {HTMLElement[]}*/
        ([...(document.querySelectorAll(".to-reveal" + selector))]);

    elementsOfInterest.forEach((el, i) => {
        //  We wrap it inside setTimeout so that elements reveal/hide one-by-one instead of all at once.
        //  You can remove setTimeout if you'd like to reveal/hide all at once.
        setTimeout(() => {
            toggleReveal(el, active);
        }, Math.min(MAX_ANIMATION_TIME, i * 30));
    });
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

