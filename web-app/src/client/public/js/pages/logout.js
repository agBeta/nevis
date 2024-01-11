import { toggleRevealOfMenu } from "../reveal-animation.js";
import {
    showHideLoadingSpinner,
    showToast,
    updateMainMenuItemsBasedOnUserLoggedIn,
} from "../ui-utils.js";
import { clearAllCookies, makeRetry } from "../utils.js";

/**
 * @param {{ postLogout: PostLogout }} param0
 * @returns {PageView}
 */
export default function makeLogoutView({ postLogout }) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "logout_view";

    return Object.freeze({
        render,
        NAME: THIS_VIEW,
    });

    async function render() {
        //  We could just send postLogout and redirect back to home. BUT...
        //  But in future versions, we may ask user confirmation, if for example the user has uploaded
        //  an image file and upload hasn't finished yet. So having a separate page view for logout
        //  gives more flexibility.
        //  Anyway, at the moment we will display a loading spinner and wait for logout request to come
        //  back successful.
        document.title = "در حال خروج ...";
        pageEl.innerHTML = "";

        toggleRevealOfMenu(false);
        //  Actually it might be best to prevent clicking on menu toggle (and any routing) until logout
        //  response comes back, but for simplicity we don't.

        showHideLoadingSpinner(pageEl, true);

        //  It isn't ux-friendly to await below, but for consistency and simplicity we do await.
        try {
            await makeRetry(postLogout, 3)();
            clearAllCookies(); // <-- doesn't seem necessary, as server clears the role cookie. But let it be.
            updateMainMenuItemsBasedOnUserLoggedIn();
            window.Router.navigateTo("/");
        }
        catch (err) {
            showHideLoadingSpinner(pageEl, false);
            showToast({
                text: "متاسفانه خطایی در فرآیند خروج از حساب کاربری به وجود آمده".concat(".")
                    + " " + "لطفا مجددا اقدام به خروج نمایید".concat("."),
                kind: "failure",
            });
            // For simplicity and consistency in rendering logout again, let's navigate back to home.
            window.Router.navigateTo("/");
        }
    }
}



/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").PostLogout} PostLogout
 */
