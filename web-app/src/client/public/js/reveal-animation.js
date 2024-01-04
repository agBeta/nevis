document.addEventListener("DOMContentLoaded", () => {

    const panelElementsToReveal = /**@type {HTMLElement[]}*/
        ([...document.querySelectorAll(".to-reveal:not(.nav-item)")]);
    const menuElementsToReveal = /**@type {HTMLElement[]}*/
        ([...document.querySelectorAll("nav[aria-label='Main Menu'] .to-reveal")]);
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));
    const menu = /**@type {HTMLElement}*/(document.querySelector("nav[aria-label='Main Menu']"));

    menuToggle.addEventListener("click", onMenuToggleClick);
    // Reveal menu by default when the page loads.
    menuToggle.click();

    function onMenuToggleClick() {
        if (menu.classList.contains("active")) {
            menuToggle.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuElementsToReveal.forEach(wrap => {
                toggleReveal(wrap, false);
            });
            menu.classList.remove("active");
            panelElementsToReveal.forEach(wrap => {
                toggleReveal(wrap, true);
            });
        }
        else {
            menuToggle.classList.add("active");
            menuToggle.setAttribute("aria-expanded", "true");
            panelElementsToReveal.forEach(wrap => {
                toggleReveal(wrap, false);
            });
            menu.classList.add("active");
            menuElementsToReveal.forEach(wrap => {
                toggleReveal(wrap, true);
            });
        }

        //  You may also add aria-hidden="true" for screen readers when menu is not expanded. We didn't do that.
        //  Some useful links:
        //  https://www.linkedin.com/pulse/hiding-elements-from-screen-readers-girijesh-tripathi.
        //  https://snook.ca/archives/html_and_css/hiding-content-for-accessibility.
    }
});


/** @param {HTMLElement} el  @param {boolean} active  */
function toggleReveal(el, active) {
    if (active) {
        el.classList.add("active");
    }
    else {
        el.classList.remove("active");
    }
}

