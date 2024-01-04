import { fetchBlogPaginated } from "./api.js";
import makeBlogPaginatedView from "./blog-paginated-view.js";
import makeRouter from "./router.js";
import { onMenuToggleClick } from "./reveal-animation.js";

const routes = [
    { path: "/blog/paginated", pageView: makeBlogPaginatedView({ fetchBlogPaginated }) }
];

if (history.scrollRestoration) {
    history.scrollRestoration = "auto";
}
const Router = makeRouter({ routes });

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = /**@type {HTMLElement}*/(document.querySelector(".menu-toggle"));
    menuToggle.addEventListener("click", onMenuToggleClick);
    
    Router.init();
});




