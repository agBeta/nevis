document.addEventListener("DOMContentLoaded", () => {
    handleRevealAnimation();
});


export default function handleRevealAnimation() {
    const panelElementsToReveal = /**@type {HTMLElement[]}*/
        ([...document.querySelectorAll(".to-reveal:not(.nav-item)")]);
    const menuElementsToReveal = /**@type {HTMLElement[]}*/
        ([...document.querySelectorAll("nav[aria-label='Main Menu'] .to-reveal")]);
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));
    const menu = /**@type {HTMLElement}*/(document.querySelector("nav[aria-label='Main Menu']"));

    menuToggle.addEventListener("click", onMenuToggleClick);
    revealAllPanelElements();


    /** @param {HTMLElement} wrap  @param {boolean} active  */
    function toggleReveal(wrap, active) {
        requestAnimationFrame(() => {
            if (active) {
                wrap.classList.add("active");
            }
            else {
                wrap.classList.remove("active");
            }
        });
    }

    function revealAllPanelElements() {
        panelElementsToReveal.forEach((wrap, i) => {
            setTimeout(() => {
                wrap.classList.add("active");
            }, (i + 1) * 50);
        });
    }

    function onMenuToggleClick() {
        if (menu.classList.contains("active")) {
            menuToggle.classList.remove("active");
            menuElementsToReveal.forEach(wrap => {
                toggleReveal(wrap, false);
            });
            setTimeout(() => { menu.classList.remove("active"); }, 200);
            setTimeout(() => {
                panelElementsToReveal.forEach(wrap => {
                    toggleReveal(wrap, true);
                });
            }, 200);
        }
        else {
            menuToggle.classList.add("active");
            panelElementsToReveal.forEach(wrap => {
                toggleReveal(wrap, false);
            });

            setTimeout(() => {
                menu.classList.add("active");
            }, 300);
            setTimeout(() => {
                menuElementsToReveal.forEach(wrap => {
                    toggleReveal(wrap, true);
                });
            }, 300);
        }

    }
}

