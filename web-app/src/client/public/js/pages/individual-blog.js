import { toggleRevealOfMenu, toggleRevealOfPageElements } from "../reveal-animation.js";
import { showHideLoadingSpinner } from "../ui-utils.js";

/** @param {{ fetchBlog: FetchBlog }} param0 @returns {PageView} */
export default function makeIndividualBlogView({
    fetchBlog,
}) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "individual_blog_view";

    let /**@type {"loading"|"free"}*/ ongoingDisplayState;

    return Object.freeze({
        render: safelyRender,
        NAME: THIS_VIEW,
    });

    /** @param {{ blogId: string }} params  */
    async function safelyRender({ blogId }) {
        const timestamp = Date.now();
        window.SMI.setCurrentViewOnScreen(THIS_VIEW, timestamp);

        try {
            await render({
                timestamp,
                blogId,
            });
        }
        catch (err) {
            const cv = window.SMI.getCurrentViewOnScreen();
            const isUserCurrentlyAtThisPage = cv.name === THIS_VIEW && cv.timestamp === timestamp;
            if (!isUserCurrentlyAtThisPage) {
                return;
            }
            if (ongoingDisplayState === "loading") {
                showHideLoadingSpinner(pageEl, false);
            }
            ongoingDisplayState = "free";

            const errorEl = document.createElement("div");
            errorEl.classList.add("error-container", "to-reveal", "active");
            errorEl.innerHTML = /*html*/`
                <h2 class="error-title">${"خطا"}</h2>
                <p>${err.message}</p>
            `;
            const button = document.createElement("button");
            button.textContent = "بازگشت به خانه";
            button.addEventListener("click", function goBackToHome() {
                errorEl.remove();
                window.Router.navigateTo("/", false);
            });
            errorEl.appendChild(button);
            pageEl.innerHTML = "";
            pageEl.appendChild(errorEl);
        }
    }

    /** @param {{ timestamp: number, blogId: string }} param0 */
    async function render({ timestamp, blogId }) {
        // ? For comments, see blogs.js implementation.
        document.title = "نوشته ...";
        pageEl.innerHTML = "";
        pageEl.setAttribute("aria-hidden", "false");
        pageEl.setAttribute("aria-live", "polite");
        ongoingDisplayState = "loading";
        showHideLoadingSpinner(pageEl, true);
        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            //  There isn't any nav item for individual blog, but for better ui let's choose one of them.
            //  @ts-ignore
            if (el.pathname.includes("/blog/paginated")) el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });

        toggleRevealOfMenu(false);

        const [/**@type {}*/result,] = await Promise.all([
            fetchBlog({ blogId }),
            new Promise((resolve, reject) => setTimeout(resolve, 300)),
        ]);

        if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) return;
        if (window.SMI.getCurrentViewOnScreen().timestamp !== timestamp) {
            //  So the user is currently on this view but he has left and came back while the result
            //  was being fetched from server.
            //  By design of our API, at the moment, an individual blog cannot be edited/deleted.
            //  UNLIKE paginated-blogs, we can continue. BUT let's NOT continue. Why? Because the
            //  other render() (triggered when user came back to this page) will fetch and render
            //  the result.
            return;
        }

        if (result.statusCode !== 200) {
            throw new Error(result.statusCode + " " + result.body.error);
        }

        showHideLoadingSpinner(pageEl, false);
        ongoingDisplayState = "free";
        const /**@type {import("#types").Blog}*/ blog = result.body;
        const createdAt = new Date(blog.createdAt);

        const containerEl = document.createElement("article");
        containerEl.id = "individual-blog";
        containerEl.classList.add("u-flow-content");
        // We need the outer element for <h1>. See .to-reveal selector in global.css
        containerEl.innerHTML = /*html*/`
            <header class="to-reveal">
                <h1 class="h1">${blog.blogTitle}</h1>
            </header>
            <div class="to-reveal">
                <p dir="rtl" class="body">${blog.blogBody}</p>
            </div>
            <footer class="info to-reveal">
                    <time datetime="${createdAt.toISOString()}" class="to-reveal" dir="rtl">
                        ${createdAt.toLocaleDateString("fa", { weekday: "long" }) + " " +
            createdAt.toLocaleDateString("fa")
            + " ساعت " + createdAt.toLocaleTimeString("fa", { hour: "2-digit", minute: "2-digit" })}
                    </time>
            </footer>
        `;

        pageEl.appendChild(containerEl);
        document.title = blog.blogTitle;
        toggleRevealOfPageElements(true);
    }
}



/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").FetchBlog} FetchBlog
 */
