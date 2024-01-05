
export function onMenuToggleClick() {
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));
    const menu = /**@type {HTMLElement}*/(document.querySelector("nav[aria-label='Main Menu']"));

    // We need to re-query the following, since elements might be added/removed from DOM recently.
    // Also we need to make an array (using [...]), so that we can use index in forEach callback.
    const panelElementsToReveal = /**@type {HTMLElement[]}*/
        ([...(document.querySelectorAll(".to-reveal:not(.nav-item)"))]);

    const menuElementsToReveal = /**@type {HTMLElement[]}*/
        ([...(document.querySelectorAll("nav[aria-label='Main Menu'] .to-reveal"))]);

    if (menu.classList.contains("active")) {
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuElementsToReveal.forEach(el => {
            toggleReveal(el, false);
        });
        menu.classList.remove("active");
        menu.setAttribute("aria-hidden", "true");

        panelElementsToReveal.forEach((el, i) => {
            //  We wrap it inside setTimeout so that elements reveal one-by-one instead of all at the same
            //  time. You can remove setTimeout if you want to reveal all at once.
            setTimeout(() => toggleReveal(el, true), i * 50);
        });
    }
    else {
        menuToggle.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        panelElementsToReveal.forEach(el => {
            toggleReveal(el, false);
        });
        menu.classList.add("active");
        menu.setAttribute("aria-hidden", "false");

        menuElementsToReveal.forEach(el => {
            toggleReveal(el, true);
        });
    }
    //  You may also add aria-hidden="true" to nav-items for screen readers when menu isn't expanded. We didn't
    //  do that. Some useful links:
    //  https://www.linkedin.com/pulse/hiding-elements-from-screen-readers-girijesh-tripathi.
    //  https://snook.ca/archives/html_and_css/hiding-content-for-accessibility.
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

