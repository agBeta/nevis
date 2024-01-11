import { toggleRevealOfMenu, toggleRevealOfPageElements } from "../reveal-animation.js";
import {
    registerListenerToDisplayErrorForInvalidInput,
    showHideLoadingSpinner,
    showToast,
} from "../ui-utils.js";
import { makeRetry } from "../utils.js";

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
                const titleInputEl =  /**@type {HTMLInputElement}*/
                    (pageEl.querySelector("input[name='title']"));
                registerListenerToDisplayErrorForInvalidInput(titleInputEl);

                const textAreaEl = /**@type {HTMLTextAreaElement}*/ (pageEl.querySelector("textarea"));
                registerListenerToDisplayErrorForInvalidInput(textAreaEl);
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
                <input id="title" name="title" type="text" autocomplete="off"
                    value="${state?.enteredBlogTitle ?? ""}" required/>
            </div>
            <div class="to-reveal form-group body-from-group">
                <label for="body">متن</label>
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

            // @ts-ignore
            const /**@type {string}*/ enteredBlogTitle = (document.querySelector("input[name='title']")).value;
            // @ts-ignore
            const /**@type {string}*/ enteredBlogBody = (document.querySelector("textarea[name='body']")).value;
            const enteredBlogTopic = "Technology"; // hard code for now.
            const enteredImageUrl = undefined;

            const allOfEntered = Object.freeze({
                enteredBlogTitle,
                enteredBlogBody,
                enteredBlogTopic,
                enteredImageUrl
            });

            toggleRevealOfPageElements(false);
            setTimeout(() => {
                formEl.remove();
                showHideLoadingSpinner(containerEl, true);
            }, window.MAX_ANIMATION_TIME - 1000 / 60);

            //  If we successfully post a blog, we will clear [lastActionId] from state. So don't
            //  worry about using [lastActionId]. It would be null if it's already used up.
            let actionId = state?.lastActionId ?? null;

            try {
                window.SMI.setSate(THIS_VIEW, {
                    state: "loading",
                    ...allOfEntered,
                });

                if (actionId == null) {
                    actionId = (await requestNewAction("add-blog")).actionId;
                    console.log(" 🚒 ", actionId);
                }

                window.SMI.setSate(THIS_VIEW, /**@type {Exclude<AddBlogState, null>}*/({
                    state: "loading",
                    ...allOfEntered,
                    //  We must store actionId. If we fail to post blog using this action (see few
                    //  lines below), then we would use the same actionId.
                    lastActionId: actionId,
                }));

                console.log(actionId);

                const data = {
                    blogTitle: enteredBlogTitle,
                    blogBody: enteredBlogBody,
                    blogTopic: enteredBlogTopic,
                    imageUrl: enteredImageUrl,
                    actionId,
                };
                /**@type {Awaited<ReturnType<PostBlog>>}*/
                const result = await (makeRetry(postBlog, 3, 1000, true))(data);

                //  So we have successfully added a new blog. Let's clear the state,
                //  especially lastActionId ❗.
                window.SMI.setSate(THIS_VIEW, { state: "add" });

                showToast({
                    kind: "success",
                    text: "نوشته شما با موفقیت ارسال شد" + "."
                });

                if (window.SMI.getCurrentViewOnScreen().name === THIS_VIEW) {
                    //  ↗️↗️ If user isn't on this view, we don't want to navigate him away from
                    //  where he is currently at.
                    window.Router.navigateTo(`/blog/${result.blogId}`);
                }
                return;
            }
            catch (err) {
                window.SMI.setSate(THIS_VIEW, /**@type {Exclude<AddBlogState, null>}*/({
                    state: "error",
                    error: err.message,
                    ...allOfEntered,
                    lastActionId: actionId, // <-- don't forget this one!
                }));
            }
            //  So we just updated state appropriately. Now let's take care of rendering
            //  the state we just set.
            if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) {
                showToast({
                    kind: "failure",
                    text: "متاسفانه ارسال نوشته جدید با خطا مواجه شد" + ".",
                });
            }
            else {
                render();
            }
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
                state: "add",
                enteredBlogTitle: state.enteredBlogTitle,
                enteredBlogBody: state.enteredBlogBody,
                enteredBlogTopic: state.enteredBlogTopic,
                enteredImageUrl: state.enteredImageUrl,
                lastActionId: state.lastActionId,
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
