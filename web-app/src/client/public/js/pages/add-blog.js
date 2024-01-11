import { toggleRevealOfMenu, toggleRevealOfPageElements } from "../reveal-animation.js";
import { registerListenerToDisplayErrorForInvalidInput } from "../ui-utils.js";

/**
 * @param {{
 *      requestNewAction: RequestNewAction,
 *      postBlog: PostBlog
 * }} param0
 * @returns {PageView}
 */
export default function makeAddBlogView({
    requestNewAction,
    postBlog,
}) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "add_blog_view";

    return Object.freeze({
        render,
        NAME: THIS_VIEW,
    });


    async function render() {
        window.SMI.setCurrentViewOnScreen(THIS_VIEW, /*not important here*/Date.now());

        // First things that should be done regardless of state.
        document.title = "نوشته جدید";
        pageEl.setAttribute("aria-hidden", "false");
        pageEl.setAttribute("aria-live", "polite");
        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            // @ts-ignore
            if (el.pathname === "/add-blog") el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });
        toggleRevealOfMenu(false);

        const lastState = /**@type {AddBlogState}*/(window.SMI.getState(THIS_VIEW));

        if (lastState == null || lastState.state === "add") {
            // Fresh
            renderStepOfAddBlog(lastState);
        }
        else if (lastState.state === "loading") {
            //  The remaining lines after loading phase (on last trigger of render(..) which caused
            //  this loading state) will take care of everything. We just return now.
            return;
        }
        else if (lastState.state === "error") {
            renderError(lastState);
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // ↖️↖️ Making sure elements are inserted to DOM.
                pageEl.querySelectorAll("input").forEach(el => {
                    registerListenerToDisplayErrorForInvalidInput(el);
                });
            });
        });
    }

    /** @param {AddBlogState} state  */
    function renderStepOfAddBlog(state) {
        pageEl.innerHTML = "";
        const containerEl = document.createElement("div");
        containerEl.classList.add("u-container", "add");
        containerEl.id = "add-blog";
        containerEl.innerHTML = /*html*/`
            <h1 class="u-hide-visually">افزودن نوشته جدید</h1>
        `;

        const formEl = document.createElement("form");
        formEl.classList.add("form", "u-flow-content");
        formEl.classList.add("form-add-blog");
        formEl.setAttribute("accept-charset", "utf-8");
        //  If we come from some sort of go-back-step procedure, we need to populate title input
        //  and other fields.
        formEl.innerHTML = /*html*/`
            <div class="to-reveal form-group">
                <label for="title">عنوان</label>
                <input id="title" name="title" type="text" autocomplete="off" autofocus
                    value="${state?.enteredBlogTitle ?? ""}" required/>
            </div>
            <div class="to-reveal form-group body-from-group">
                <label for="title">متن</label>
                <textarea id="body" name="body" autocomplete="off" minlength="10" maxlength="4000"
                    required>${state?.enteredBlogBody ?? ""}</textarea>
            </div>
            <div class="to-reveal form-group">
                <button type="submit">ارسال نوشته</button>
            </div>
        `;
        containerEl.appendChild(formEl);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);

        formEl.addEventListener("submit", async (ev) => {
            ev.preventDefault();
            // TODO
        });
    }


    /** @param {Exclude<AddBlogState, null>} state  */
    function renderError(state) {
        pageEl.innerHTML = ""; // Safest way to prevent inconsistency. Forget about exit animations.

        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "add-blog";

        const errorEl = document.createElement("div");
        errorEl.classList.add("error-container", "to-reveal", "active");
        errorEl.innerHTML = /*html*/`
            <h1 class="error-title">${"خطا"}</h1>
            <p class="en" dir="ltr">${state?.error}</p>
        `;

        const button = document.createElement("button");
        button.textContent = "متوجه شدم";
        button.addEventListener("click", function goBack() {
            // errorEl.remove(); // <-- not necessary, since we're going to call render below.
            window.SMI.setSate(THIS_VIEW, {
                step: "add",
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
}



/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").RequestNewAction} RequestNewAction
 * @typedef {import("../types.d.ts").PostBlog} PostBlog
 * @typedef {import("../types.d.ts").AddBlogState} AddBlogState
 */
