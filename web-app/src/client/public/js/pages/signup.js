import { toggleRevealOfPageElements } from "../reveal-animation.js";
import { showHideLoadingSpinner } from "../ui-utils.js";

/** @returns {PageView} */
export default function makeHomeView({
    postEmailForCode,
    postSingup,
}) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "signup_view";
    let /**@type {"loading"|"free"}*/ ongoingDisplayState;
    let step = 0;

    return Object.freeze({
        render: safelyRender,
        NAME: THIS_VIEW,
    });

    async function safelyRender() {
        window.SMI.setCurrentViewOnScreen(THIS_VIEW, Date.now());
        try {
            await render();
        }
        catch (err) {
            
            if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) {
                return;
            }

            // App might be crashed while loading data from server, etc. So we first check:
            if (ongoingDisplayState === "loading") {
                showHideLoadingSpinner(pageEl, false);
            }
            ongoingDisplayState = "free";

            const errorEl = document.createElement("div");
            errorEl.classList.add("error-container", "to-reveal", "active");
            errorEl.innerHTML = /*html*/`
                <h2 class="error-title">${"خطا"}</h2>
                <p class="en" dir="ltr">${err.message}</p>
            `;
            const button = document.createElement("button");
            // Simplest rescue plan from error.
            button.textContent = "بازگشت به خانه";
            button.addEventListener("click", function retry(){
                errorEl.remove();
                window.SMI.setSate(THIS_VIEW, { step: 0 });
                window.location.href = "/";
            });
            errorEl.appendChild(button);
            pageEl.innerHTML = "";
            pageEl.appendChild(errorEl);
        }
    }

    async function render() {
        pageEl.setAttribute("aria-hidden", "false");
        pageEl.setAttribute("aria-live", "polite");
        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            // @ts-ignore
            if (el.pathname === "/signup") el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });

        if (ongoingDisplayState === "loading") {
            //  Still last visit didn't finish rendering. So we let last render take care of
            //  rendering when it finished.
            return;
        }
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "signup";

        const lastSavedState = /**@type {null | {
            step: number,
            enteredEmail?: string,
            error?: string,
        }}*/ (window.SMI.getState(THIS_VIEW));

        if (lastSavedState != null && lastSavedState.error) {
            throw new Error();
        }

        if (lastSavedState == null || lastSavedState.step === 0){
            document.title = "ثبت‌نام";
            containerEl.innerHTML = /*html*/`
                <h1 class="h1 to-reveal">فرم ثبت‌نام</h1>
            `;
            const formEl = document.createElement("form");
            formEl.classList.add("form");
            formEl.setAttribute("accept-charset", "utf-8");

            formEl.innerHTML = /*html*/`
                <div class="to-reveal">
                    <label for="email">ایمیل</label>
                </div>
                <input id="email" name="email_to_verify" type="email" autocomplete="email" required/>
                <button type="submit">ارسال کد تایید</button>
            `;
            formEl.addEventListener("submit", async(ev) => {
                ev.preventDefault();
                toggleRevealOfPageElements(false, ".form");
                showHideLoadingSpinner(containerEl, true);

                let fd = new FormData(formEl);

                const [result, ] = await Promise.all([
                    postEmailForCode({
                        email: fd.get("email_to_verify"),
                        purpose: "signup",
                    }),
                    new Promise((resolve, reject) => setTimeout(resolve, 300)),
                ]);
            });
        }
        else if (lastSavedState.step === 1) {
            document.title = "ثبت‌نام";
        }

        containerEl.appendChild(formEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }
}

// ! dont forget to reset to step 0 after successful signup.

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 */
