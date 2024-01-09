import { toggleRevealOfMenu, toggleRevealOfPageElements } from "../reveal-animation.js";
import {
    registerListenerToDisplayErrorForInvalidInput,
    showHideLoadingSpinner,
    showToast,
    updateMainMenuItemsBasedOnUserLoggedIn,
} from "../ui-utils.js";

/**
 * @param {{ postLogin: PostLogin }} param0
 * @returns {PageView}
 */
export default function makeLoginView({ postLogin }) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "login_view";

    return Object.freeze({
        render,
        NAME: THIS_VIEW,
    });


    async function render() {
        window.SMI.setCurrentViewOnScreen(THIS_VIEW, /*not important here -> */Date.now());
        document.title = "ورود";
        pageEl.innerHTML = "";
        pageEl.setAttribute("aria-hidden", "false");
        pageEl.setAttribute("aria-live", "polite");
        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            // @ts-ignore
            if (el.pathname === "/login") el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });
        toggleRevealOfMenu(false);

        const lastState = /**@type {LoginState}*/(window.SMI.getState(THIS_VIEW));

        if (lastState == null || lastState.state === "login") {
            renderLogin();
        }
        else if (lastState.state === "loading") {
            // Do nothing. Why? See signup.js for comments.
            return;
        }
        else if (lastState.state === "error_login") {
            renderError(lastState.error || "Unknown error");
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // It's safer to omit checkbox. Validity state for checkbox is useless.
                pageEl.querySelectorAll("input:not([type='checkbox'])").forEach(el => {
                    registerListenerToDisplayErrorForInvalidInput(el);
                });
            });
        });
    }

    function renderLogin() {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("u-container");
        containerEl.id = "login";
        containerEl.innerHTML = /*html*/`
            <h1 class="u-hide-visually">ورود</h1>
        `;

        const formEl = document.createElement("form");
        formEl.classList.add("form", "u-flow-content");
        formEl.setAttribute("accept-charset", "utf-8");

        formEl.innerHTML = /*html*/`
            <div class="to-reveal form-group">
                <label for="email">ایمیل</label>
                <input id="email" name="email" type="email" autocomplete="email" value=""/>
            </div>
            <div class="to-reveal form-group">
                <label for="password">رمز عبور</label>
                <input id="password" name="password"  type="password" autocomplete="off"
                    minlength="1" maxlength="30" value="" required/>
            </div>
            <div class="to-reveal form-group checkbox-ful">
                <input type="checkbox" id="rememberMe" name="rememberMe" />
                <label for="rememberMe">مرا بخاطر بسپار</label>
            </div>
            <div class="to-reveal form-group">
                <button type="submit">ورود</button>
            </div>
        `;
        containerEl.appendChild(formEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);

        formEl.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            // @ts-ignore
            const /**@type {string}*/ email = (document.querySelector("input[name='email']")).value;
            // @ts-ignore
            const /**@type {string}*/ password = (document.querySelector("input[name='password']")).value;
            // @ts-ignore
            const /**@type {boolean}*/ rememberMe = (document.querySelector("input[name='rememberMe']")).checked;

            toggleRevealOfPageElements(false);
            setTimeout(() => {
                formEl.remove();
                showHideLoadingSpinner(containerEl, true);
            }, window.MAX_ANIMATION_TIME - 1000 / 60 /*roughly 1 fps*/);

            try {
                window.SMI.setSate(THIS_VIEW, { state: "loading" });
                console.log("Here...........");
                const [result,] = await Promise.all([
                    postLogin({ email, password, rememberMe }),
                    new Promise((resolve, reject) => setTimeout(resolve, 1000 + window.MAX_ANIMATION_TIME)),
                ]);

                if (result.statusCode === 200) {
                    window.SMI.setSate(THIS_VIEW, {
                        state: "login", // for next time, i.e. if user logs out and want to login later.
                    });
                    updateMainMenuItemsBasedOnUserLoggedIn();
                    // showToast({
                    //     text: "کاربر محترم" + ` ${result.body.userDisplayName} ` + "خوش آمدید!",
                    //     kind: "success",
                    // });
                    window.Router.navigateTo("/", false);
                    return;
                }
                else {
                    window.SMI.setSate(THIS_VIEW, {
                        state: "error_login",
                        error: result.body.error,
                    });
                }
            }
            catch (err) {
                window.SMI.setSate(THIS_VIEW, {
                    state: "error_login",
                    error: err.message,
                });
            }
            if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) return;
            render();
            return;
        });
    }


    /**@param {string} error */
    function renderError(error) {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "login";

        const errorEl = document.createElement("div");
        errorEl.classList.add("error-container", "to-reveal", "active");
        errorEl.innerHTML = /*html*/`
            <h1 class="error-title">${"خطا"}</h1>
            <p class="en" dir="ltr">${error}</p>
        `;

        const button = document.createElement("button");
        button.textContent = "متوجه شدم";
        button.addEventListener("click", function goBackToCodeStep() {
            window.SMI.setSate(THIS_VIEW, { state: "login" });
            //  No need to check if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW). Of course
            //  when click happens on the button, this view is on the screen.
            render();
        });

        errorEl.appendChild(button);
        containerEl.appendChild(errorEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }
}

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").PostLogin} PostLogin
 * @typedef {import("../types.d.ts").LoginState} LoginState
 */
