import { toggleRevealOfPageElements } from "../reveal-animation.js";
import { showHideLoadingSpinner, showToast } from "../ui-utils.js";

/**
 * @param {{ postEmailForCode: PostEmailForCode, postSignup: PostSignup }} param0
 * @returns {PageView}
 */
export default function makeHomeView({
    postEmailForCode,
    postSignup,
}) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "signup_view";

    return Object.freeze({
        render,
        NAME: THIS_VIEW,
    });


    async function render() {
        window.SMI.setCurrentViewOnScreen(THIS_VIEW, /*not important here*/Date.now());

        // First things that should be done regardless of state.
        document.title = "ثبت‌نام";
        pageEl.setAttribute("aria-hidden", "false");
        pageEl.setAttribute("aria-live", "polite");
        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            // @ts-ignore
            if (el.pathname === "/signup") el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });

        const lastState = /**@type {SignupState}*/(window.SMI.getState(THIS_VIEW));

        if (lastState == null || lastState.step === "code") {
            // Fresh
            renderStepOfEmailForCode(lastState);
            return;
        }
        if (lastState.step === "loading") {
            //  The remaining lines after loading phase (on last trigger of render(..) which caused
            //  this loading state) will take care of everything. We just return now.
            return;
        }
        if (lastState.step === "signup") {
            renderStepOfSignup();
            return;
        }
        if (lastState.step === "error_code") {
            renderErrorForStepOfCode(lastState);
            return;
        }
        if (lastState.step === "error_signup") {
            renderErrorForStepOfSignup();
            return;
        }
    }

    /** @param {SignupState} state  */
    function renderStepOfEmailForCode(state) {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        containerEl.innerHTML = /*html*/`
            <header class="to-reveal">
                <h1 class="h1">ثبت‌نام</h1>
            </header>
        `;

        const formEl = document.createElement("form");
        formEl.classList.add("form");
        formEl.setAttribute("accept-charset", "utf-8");

        //  If we come from some sort of go-back-step procedure, we need to populate email input
        //  with enteredEmail.;

        formEl.innerHTML = /*html*/`
            <div class="to-reveal">
                <label for="email">ایمیل</label>
                <input id="email" name="email" type="email" autocomplete="email"
                    value="${state?.enteredEmail ?? ""}"/>
                <button type="submit">ارسال کد تایید</button>
            </div>
        `;
        containerEl.appendChild(formEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);

        formEl.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            // @ts-ignore
            const /**@type {string}*/ enteredEmail = (document.querySelector("input[name='email']")).value;

            if (enteredEmail == null || enteredEmail.length < 1) {
                window.SMI.setSate(THIS_VIEW, {
                    step: "error_code",
                    enteredEmail: "",
                    error: "Email is not valid."
                });
                if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) return;
                // We call render again. It will render based on the state we just set above.
                render();
                return;
            }

            toggleRevealOfPageElements(false);
            showHideLoadingSpinner(containerEl, true);

            try {
                window.SMI.setSate(THIS_VIEW, {
                    step: "loading",
                    enteredEmail,
                });
                const [result,] = await Promise.all([
                    postEmailForCode({ email: enteredEmail, purpose: "signup" }),
                    new Promise((resolve, reject) => setTimeout(resolve, 300)),
                ]);

                if (result.statusCode === 201) {
                    window.SMI.setSate(THIS_VIEW, {
                        step: "signup",
                        enteredEmail,
                    });
                }
                else {
                    window.SMI.setSate(THIS_VIEW, {
                        step: "error_code",
                        enteredEmail,
                        error: result.body.error,
                    });
                }
            }
            catch (err) {
                window.SMI.setSate(THIS_VIEW, {
                    step: "error_code",
                    enteredEmail,
                    error: err.message,
                });
            }
            //  So we just updated state appropriately. Now let's take care of rendering
            //  the state we just set.

            if (window.SMI.getCurrentViewOnScreen().name === THIS_VIEW) return;
            render();
            return;
        });
    }


    function renderStepOfSignup() {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        //  goes here
        // ? todo

        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }


    /** @param {SignupState} state  */
    function renderErrorForStepOfCode(state) {
        pageEl.innerHTML = ""; // Safest way to prevent inconsistency. Forget about exit animations.
        const errorEl = document.createElement("div");
        errorEl.id = "signup";

        errorEl.classList.add("error-container", "to-reveal", "active");
        errorEl.innerHTML = /*html*/`
            <h2 class="error-title">${"خطا"}</h2>
            <p class="en" dir="ltr">${state?.error}</p>
        `;
        const button = document.createElement("button");
        button.textContent = "متوجه شدم";

        button.addEventListener("click", function goBackToCodeStep() {
            // errorEl.remove(); // <-- not necessary, since we're going to call render below.
            window.SMI.setSate(THIS_VIEW, {
                step: "code",
                enteredEmail: state?.enteredEmail,
            });
            //  No need to check if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW). Of course
            //  when click happens on the button, this view is on the screen.
            render();
        });
        errorEl.appendChild(button);
        pageEl.appendChild(errorEl);
        toggleRevealOfPageElements(true);
    }


    function renderErrorForStepOfSignup() {
        pageEl.innerHTML = ""; // safest way to prevent inconsistency. Forget about exit animations
        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        // goes here
        // ? todo

        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }
}

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").PostEmailForCode} PostEmailForCode
 * @typedef {import("../types.d.ts").PostSignup} PostSignup
 *
 * @typedef {import("../types.d.ts").SignupState} SignupState
 */
