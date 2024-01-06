import "./state-manage.js";
import { updateMainMenuItemsBasedOnUserLoggedIn } from "./ui-utils.js";
import { fetchBlogPaginated, fetchBlog } from "./api.js";
import makeRouter from "./router.js";
import { onMenuToggleClick } from "./reveal-animation.js";
import makeBlogsView from "./pages/blogs.js";
import makeIndividualBlogView from "./pages/individual-blog.js";
import makeHomeView from "./pages/home.js";

window.SMI.clearStates();

const routes = [
    { path: "/blog/paginated", pageView: makeBlogsView({ fetchBlogPaginated }) },
    { path: "/blog/:blogId", pageView: makeIndividualBlogView({ fetchBlog }) },
    { path: "/", pageView: makeHomeView() }
];

if (history.scrollRestoration) {
    history.scrollRestoration = "auto";
}
const Router = makeRouter({ routes });

document.addEventListener("DOMContentLoaded", () => {
    updateMainMenuItemsBasedOnUserLoggedIn();
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




