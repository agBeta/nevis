import "./state-manage.js";
import { getValueOfRoleCookie } from "./utils.js";
import { updateMainMenuItemsBasedOnUserLoggedIn } from "./ui-utils.js";
import {
    fetchBlogPaginated,
    fetchBlog,
    postEmailForCode,
    postSignup,
    postLogin,
    postLogout,
    requestNewAction,
    postBlog,
} from "./api.js";
import makeRouter from "./router.js";
import { onMenuToggleClick } from "./reveal-animation.js";

import makeBlogsView from "./pages/blogs.js";
import makeIndividualBlogView from "./pages/individual-blog.js";
import makeHomeView from "./pages/home.js";
import makeSignupView from "./pages/signup.js";
import makeLoginView from "./pages/login.js";
import makeLogoutView from "./pages/logout.js";
import makeAddBlogView from "./pages/add-blog.js";

window.SMI.clearStates();

/**@type {import("./types.d.ts").Route[]} */
const routes = [
    { path: "/blog/paginated", pageView: makeBlogsView({ fetchBlogPaginated }) },
    { path: "/blog/:blogId", pageView: makeIndividualBlogView({ fetchBlog }) },
    {
        path: "/signup",
        pageView: makeSignupView({ postEmailForCode, postSignup }),
        guard: function () {
            return {
                // If user is logged in, we won't let him go to this route.
                canPrecede: getValueOfRoleCookie() !== "user",
                redirectPathIfFailed: "/"
            };
        }
    },
    {
        path: "/login",
        pageView: makeLoginView({ postLogin }),
        guard: function () {
            return {
                // If user is logged in, we won't let him go to this route.
                canPrecede: getValueOfRoleCookie() !== "user",
                redirectPathIfFailed: "/"
            };
        }
    },
    {
        path: "/add-blog",
        pageView: makeAddBlogView({ requestNewAction, postBlog }),
        guard: function () {
            return {
                canPrecede: getValueOfRoleCookie() === "user",
                redirectPathIfFailed: "/"
            };
        }
    },
    {
        path: "/logout",
        pageView: makeLogoutView({ postLogout }),
    },
    { path: "/", pageView: makeHomeView() }
];

if (history.scrollRestoration) {
    history.scrollRestoration = "auto";
}
const Router = makeRouter({ routes });

window.Router = Router;

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




