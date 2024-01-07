import { toggleRevealOfPageElements } from "../reveal-animation.js";
import { registerListenerToDisplayErrorForInvalidInput, showHideLoadingSpinner } from "../ui-utils.js";

/**
 * @param {{ postEmailForCode: PostEmailForCode, postSignup: PostSignup }} param0
 * @returns {PageView}
 */
export default function makeSignupView({
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
        }
        else if (lastState.step === "loading") {
            //  The remaining lines after loading phase (on last trigger of render(..) which caused
            //  this loading state) will take care of everything. We just return now.
            return;
        }
        else if (lastState.step === "signup") {
            renderStepOfSignup(lastState);
        }
        else if (lastState.step === "error_code") {
            renderErrorForStepOfCode(lastState);
        }
        else if (lastState.step === "error_signup") {
            renderErrorForStepOfSignup(lastState);
        }
        else if (lastState.step === "completed") {
            renderStepOfCompleted();
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Making sure elements are inserted to DOM.
                pageEl.querySelectorAll("input").forEach(el => {
                    registerListenerToDisplayErrorForInvalidInput(el);
                });
                (function add_some_more_ad_hoc_validations() {
                    if (lastState?.step === "signup") {
                        const [passEl, repeatPassEl] =
                            /**@type {HTMLInputElement[]}*/([...document.querySelectorAll("input[type='password']")]);
                        const correspondingFormGroupEl = repeatPassEl.parentElement;
                        //  We must also add listener for password element. If user changes password, we will display
                        //  error below repeatPassword if there aren't the same.
                        [passEl, repeatPassEl].forEach(el => {
                            el.addEventListener("blur", function displayErrorIfPasswordAndRepeatNotMatching() {
                                if (passEl.value !== repeatPassEl.value) {
                                    correspondingFormGroupEl?.setAttribute("data-error",
                                        "رمز عبور با تکرار آن برابر نیست."
                                    );
                                }
                            });
                        });
                    }
                })();
            });
        });
    }

    /** @param {SignupState} state  */
    function renderStepOfEmailForCode(state) {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("u-container", "code-step");
        containerEl.id = "signup";
        containerEl.innerHTML = /*html*/`
            <h1 class="u-hide-visually">ثبت‌نام</h1>
        `;

        const formEl = document.createElement("form");
        formEl.classList.add("form", "u-flow-content");
        formEl.classList.add("form-email");
        formEl.setAttribute("accept-charset", "utf-8");
        //  If we come from some sort of go-back-step procedure, we need to populate email input
        //  with enteredEmail. So we need to set "value" on input.
        formEl.innerHTML = /*html*/`
            <div class="to-reveal form-group">
                <label for="email">ایمیل</label>
                <input id="email" name="email" type="email" autocomplete="email"
                    value="${state?.enteredEmail ?? ""}"/>
            </div>
            <div class="to-reveal form-group">
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
            setTimeout(() => {
                formEl.remove();
                showHideLoadingSpinner(containerEl, true);
            }, window.MAX_ANIMATION_TIME - 1000 / 60 /*roughly 1 fps*/);

            try {
                window.SMI.setSate(THIS_VIEW, {
                    step: "loading",
                    enteredEmail,
                });
                const [result,] = await Promise.all([
                    postEmailForCode({ email: enteredEmail, purpose: "signup" }),
                    //  Showing the loading will give a better feeling to the user than quick layout shift or
                    //  content change on the page. That is why the time is quite long.
                    new Promise((resolve, reject) => setTimeout(resolve, 1500 + window.MAX_ANIMATION_TIME)),
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

            if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) return;
            render();
            return;
        });
    }

    /** @param {Exclude<SignupState, null>} state  */
    function renderStepOfSignup(state) {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("u-container", "signup-step");
        containerEl.id = "signup";
        containerEl.innerHTML = /*html*/`
            <h1 class="u-hide-visually">ثبت‌نام - مرحله ثبت اطلاعات و کد تایید</h1>
        `;

        const backButton = document.createElement("button");
        backButton.classList.add("back-btn", "to-reveal");
        backButton.setAttribute("title", "مرحله قبل");
        backButton.innerHTML = /*html*/`
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        `;

        backButton.addEventListener("click", () => {
            console.log("Clicked");
            window.SMI.setSate(THIS_VIEW, {
                step: "code",
                enteredEmail: state?.enteredEmail ?? "",
            });
            //  No need to check current view on screen. We the click event happens this view is definitely
            //  on the screen.
            //  Now, render based on the state we just set above.
            render();
            return;
        });

        const formEl = document.createElement("form");
        formEl.classList.add("form", "u-flow-content");
        formEl.classList.add("form-signup");
        formEl.setAttribute("accept-charset", "utf-8");
        //  If we come from some sort of go-back-step procedure, we need to populate inputs
        //  with their previous values.
        formEl.innerHTML = /*html*/`
            <div class="to-reveal form-group">
                <label for="displayName">نام کاربری</label>
                <input id="displayName" name="displayName" type="text" autocomplete="off"
                    minlength="2" maxlength="80" required
                    value="${state?.enteredDisplayName ?? ""}"/>
            </div>
            <div class="to-reveal form-group">
                <label for="birthYear">سال تولد (جلالی)</label>
                <input id="birthYear" name="birthYear" type="number" autocomplete="off"
                    min="1300" max="1402" required
                    value="${state?.enteredBirthYear ?? ""}"/>
            </div>
            <div class="to-reveal form-group">
                <label for="password">رمز عبور</label>
                <input id="password" name="password"  type="password" autocomplete="off"
                    minlength="3" maxlength="30" required
                    value="${state?.enteredPassword ?? ""}"/>
            </div>
            <div class="to-reveal form-group">
                <label for="repeatPassword">تکرار رمز عبور</label>
                <input id="repeatPassword" name="repeatPassword" type="password" autocomplete="off"
                    minlength="3" maxlength="30" required
                    value="${state?.enteredRepeatPassword ?? ""}"/>
            </div>
            <div class="to-reveal form-group">
                <label for="code">جهت تکمیل ثبت‌نام لطفا کد تایید ارسال‌شده به ایمیل‌تان را در زیر وارد نمایید:</label>
                <input id="code" name="code" type="text" autocomplete="off"
                    minlength="6" maxlength="6" required
                    value="${state?.enteredCode ?? ""}"/>
            </div>
            <div class="to-reveal form-group">
                <button type="submit">ثبت‌نام</button>
            </div>
        `;

        containerEl.appendChild(backButton);
        containerEl.appendChild(formEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);

        formEl.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            // @ts-ignore
            const /**@type {string}*/ enteredDisplayName = (document.querySelector("input[name='displayName']")).value;
            // @ts-ignore
            const /**@type {string}*/ enteredBirthYear = (document.querySelector("input[name='birthYear']")).value;
            // @ts-ignore
            const /**@type {string}*/ enteredPassword = (document.querySelector("input[name='password']")).value;
            // @ts-ignore
            const /**@type {string}*/ enteredRepeatPassword = (document.querySelector("input[name='repeatPassword']")).value;
            // @ts-ignore
            const /**@type {string}*/ enteredCode = (document.querySelector("input[name='code']")).value;
            const enteredEmail = state.enteredEmail ?? "";

            // Some more ad-hoc validation
            if (enteredPassword !== enteredRepeatPassword) {
                return;
            }

            const allOfEntered = Object.freeze({
                enteredEmail,
                enteredBirthYear,
                enteredCode,
                enteredPassword,
                enteredRepeatPassword,
                enteredDisplayName,
            });

            toggleRevealOfPageElements(false);
            setTimeout(() => {
                formEl.remove();
                showHideLoadingSpinner(containerEl, true);
            }, window.MAX_ANIMATION_TIME - 1000 / 60);

            try {
                window.SMI.setSate(THIS_VIEW, {
                    step: "loading",
                    ...allOfEntered,
                });
                const [result,] = await Promise.all([
                    postSignup({
                        email: enteredEmail ?? "",
                        displayName: enteredDisplayName,
                        birthYear: Number(enteredBirthYear),
                        password: enteredPassword,
                        repeatPassword: enteredRepeatPassword,
                        code: enteredCode,
                    }),
                    new Promise((resolve, reject) => setTimeout(resolve, 1500 + window.MAX_ANIMATION_TIME)),
                ]);

                if (result.statusCode === 201) {
                    window.SMI.setSate(THIS_VIEW, {
                        step: "completed",
                    });
                }
                else {
                    window.SMI.setSate(THIS_VIEW, {
                        step: "error_signup",
                        error: result.body.error,
                        ...allOfEntered,
                    });
                }
            }
            catch (err) {
                window.SMI.setSate(THIS_VIEW, {
                    step: "error_signup",
                    error: err.message,
                    ...allOfEntered,
                });
            }
            //  So we just updated state appropriately. Now let's take care of rendering
            //  the state we just set.
            if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) return;
            render();
            return;
        });
    }


    /** @param {Exclude<SignupState, null>} state  */
    function renderErrorForStepOfCode(state) {
        pageEl.innerHTML = ""; // Safest way to prevent inconsistency. Forget about exit animations.

        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        const errorEl = document.createElement("div");
        errorEl.classList.add("error-container", "to-reveal", "active");
        errorEl.innerHTML = /*html*/`
            <h1 class="error-title">${"خطا"}</h1>
            <p class="en" dir="ltr">${state?.error}</p>
        `;

        const button = document.createElement("button");
        button.textContent = "متوجه شدم";
        button.addEventListener("click", function goBackToCodeStep() {
            // errorEl.remove(); // <-- not necessary, since we're going to call render below.
            window.SMI.setSate(THIS_VIEW, {
                step: "code",
                enteredEmail: state.enteredEmail ?? "",
            });
            //  No need to check if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW). Of course
            //  when click happens on the button, this view is on the screen.
            render();
        });

        errorEl.appendChild(button);
        containerEl.appendChild(errorEl);
        pageEl.appendChild(errorEl);
        toggleRevealOfPageElements(true);
    }


    /** @param {Exclude<SignupState, null>} state  */
    function renderErrorForStepOfSignup(state) {
        // For comments see other renderError function.
        pageEl.innerHTML = "";

        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        const errorEl = document.createElement("div");
        errorEl.classList.add("error-container", "to-reveal", "active");
        errorEl.innerHTML = /*html*/`
            <h1 class="error-title">${"خطا"}</h1>
            <p class="en" dir="ltr">${state?.error}</p>
        `;

        const button = document.createElement("button");
        button.textContent = "متوجه شدم";
        button.addEventListener("click", function goBackToCodeStep() {
            window.SMI.setSate(THIS_VIEW, {
                /* 🔷 the only difference with other renderError is the state */
                step: "signup",
                enteredEmail: state.enteredEmail ?? "",
                enteredBirthYear: state.enteredBirthYear ?? "",
                enteredCode: state.enteredCode ?? "",
                enteredPassword: state.enteredPassword ?? "",
                enteredRepeatPassword: state.enteredRepeatPassword ?? "",
                enteredDisplayName: state.enteredDisplayName ?? "",
            });
            render();
        });

        errorEl.appendChild(button);
        containerEl.appendChild(errorEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }


    function renderStepOfCompleted() {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        const successEl = document.createElement("div");
        successEl.classList.add("success-container", "to-reveal", "active");
        successEl.innerHTML = /*html*/`
            <h1 class="success-title">ثبت‌نام موفق</h1>
            <p>ثبت‌نام شما با موفقیت انجام شد. جهت ورود به حساب کاربری خود به صفحه ورود مراجعه نمایید.</p>
        `;

        setTimeout(function resetEverythingForFreshSignup() {
            window.SMI.setSate(THIS_VIEW, { step: "code" });
            if (!window.location.pathname.endsWith("login")) {
                // automatic redirect
                window.location.href = "/login";
            }
        }, 4000);
    }
}

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").PostEmailForCode} PostEmailForCode
 * @typedef {import("../types.d.ts").PostSignup} PostSignup
 *
 * @typedef {import("../types.d.ts").SignupState} SignupState
 */
