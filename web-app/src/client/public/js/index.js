import "./state-manage.js";
import { fetchBlogPaginated } from "./api.js";
import makeRouter from "./router.js";
import { onMenuToggleClick } from "./reveal-animation.js";
import makeBlogsView from "./pages/blogs.js";

window.SMI.clearStates();

const routes = [
    { path: "/blog/paginated", pageView: makeBlogsView({ fetchBlogPaginated }) }
];

if (history.scrollRestoration) {
    history.scrollRestoration = "auto";
}
const Router = makeRouter({ routes });

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));

    menuToggle.addEventListener("click", onMenuToggleClick);

    document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item")
        .forEach((navItem) => {
            navItem.addEventListener("click", (ev) => {
                // Exactly the same behavior. As if we clicked on menu toggle (i.e. the cross) to close the menu.
                onMenuToggleClick();
            });
        });

    Router.init();
});




