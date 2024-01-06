import { toggleRevealOfMenu, toggleRevealOfPageElements } from "../reveal-animation.js";
import { showHideLoadingSpinner } from "../ui-utils.js";

/** @param {{ fetchBlogPaginated: FetchBlogPaginated }} param0 @returns {PageView} */
export default function makeBlogsView({
    fetchBlogPaginated,
}) {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "blogs_view";

    let /**@type {"loading"|"free"}*/ ongoingDisplayState;

    return Object.freeze({
        render: safelyRender,
        NAME: THIS_VIEW,
    });

    async function safelyRender() {
        const timestamp = Date.now();
        window.SMI.setCurrentViewOnScreen(THIS_VIEW, timestamp);

        try {
            await render({ timestamp });
        }
        catch (err) {
            const cv = window.SMI.getCurrentViewOnScreen();
            const isUserCurrentlyAtThisPage = cv.name === THIS_VIEW && cv.timestamp === timestamp;
            if (!isUserCurrentlyAtThisPage) {
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
            button.textContent = "تلاش مجدد";
            button.addEventListener("click", function retry(){
                errorEl.remove();
                safelyRender();
            });
            errorEl.appendChild(button);
            pageEl.innerHTML = "";
            pageEl.appendChild(errorEl);
        }
    }

    /** @param {{ timestamp: number }} param0 */
    async function render({ timestamp }) {
        document.title = "نوشته‌ها";
        pageEl.innerHTML = "";
        pageEl.setAttribute("aria-hidden", "false");
        pageEl.setAttribute("aria-live", "polite");
        ongoingDisplayState = "loading";
        showHideLoadingSpinner(pageEl, true);

        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            // @ts-ignore
            if (el.pathname.includes("/blog/paginated")) el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });

        //  We must include this here. Especially it covers the edge case when user is toggle menu and then
        //  clicks browser back button. Anyway, it's safe to do this.
        toggleRevealOfMenu(false);

        const params = obtainSearchParams();

        const [result,] = await Promise.all([
            fetchBlogPaginated(params),
            //  Let's wait at least a few milliseconds. This probably gives a better ux and also lets
            //  other fading elements to animate their exit gracefully. It also prevents the flashy
            //  layout shift which would be annoying for the user. The way that we have created our
            //  markup and animation, this seems the best choice for now.
            new Promise((resolve, reject) => setTimeout(resolve, 300)),
        ]);

        //  The fetch above might take some time. When we reach here we need to check if the result
        //  should be rendered or not.
        if (window.SMI.getCurrentViewOnScreen().name !== THIS_VIEW) {
            // No need to render the result.
            return;
        }
        if (window.SMI.getCurrentViewOnScreen().timestamp !== timestamp) {
            //  So the user is currently on this view but he has left and came back while the result
            //  was being fetched from server. So, again, no need to render anything. The most recent
            //  render(..) call (triggered when user came back to this page) will take care of everything.
            return;
        }

        showHideLoadingSpinner(pageEl, false);
        ongoingDisplayState = "free";

        if (result.statusCode !== 200) {
            throw new Error(result.statusCode + " " + result.body.error);
        }

        const containerEl = document.createElement("div");
        containerEl.id = "blogs";
        // We need the outer element for <h1>. See .to-reveal selector in global.css
        containerEl.innerHTML = /*html*/`
            <header class="to-reveal">
                <h1 class="h1">نوشته‌ها</h1>
            </header>
        `;

        const /**@type {import("#types").PaginatedResult}*/ current = result.body.current;

        const listElOfCurrent = document.createElement("ol");
        listElOfCurrent.classList.add("list", "u-flow-content");

        //  Result from backend is according to "direction". But we ALWAYS want to display blog-items
        //  in decreasing createdAt (equivalently decreasing orderId).
        //  In other words, when direction=newer, the first element of "current" is created BEFORE the
        //  last element. So we have to reverse it. The user should always see a consistent orders for
        //  blog items on the page.
        if (params.direction === "newer") {
            current.content.reverse();
        }

        listElOfCurrent.innerHTML = current.content.map((o) => {
            const blog = /**@type {import("#types").BlogV2}*/(o); // to make ts help us
            return /*html*/`
                <li class="blog-item to-reveal">
                    <a href="/blog/${blog.id}" data-link>
                        <h2 class="blog-title">${blog.blogTitle}</h2>
                    </a>
                    <footer>
                        <p>${blog.authorDisplayName}</p>
                        <time datetime="${new Date(blog.createdAt).toISOString()}">
                            ${new Date(blog.createdAt).toLocaleDateString("fa")}
                        </time>
                    </footer>
                </li>
            `;
        }).join("");

        // @ts-ignore
        const paginationControlEl = createElementForPaginationControls(params, result.body);

        //  It's better to attack controls elements first. User can easily move many pages without the need
        //  to scroll down every time.
        containerEl.appendChild(paginationControlEl);
        containerEl.appendChild(listElOfCurrent);
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }

    /** @returns {{ cursor: string, limit: number, direction: "older" | "newer" }} */
    function obtainSearchParams() {
        // We must use href or search, not pathname. pathname doesn't include query params.
        const urlSP = new URLSearchParams(window.location.search);
        let searchParams;

        //  The user might have navigated to another page, then come back to this page by clicking on nav-item.
        //  If the user clicks on nav-item, the params will be empty, but we want to continue from the page that
        //  was recently displayed. So ...
        const recentSearchParams = window.SMI.getState(THIS_VIEW);

        if (!urlSP.has("cursor") && recentSearchParams != null) {
            searchParams = Object.freeze({ ...recentSearchParams });
        }
        else {
            searchParams = Object.freeze({
                direction: urlSP.get("direction") ?? "older",
                limit: urlSP.has("limit") ? Number(urlSP.get("limit")) : 10,
                cursor: urlSP.get("cursor") ?? "newest",
            });
            //  So we actually have some params. Here, we don't care if params are valid or not. The consumer
            //  of this state will later decided to whether clean/error when params are invalid. Anyway...
            window.SMI.setSate(THIS_VIEW, searchParams);

            // updating href of nav-link for this view
            const blogsNavLink = /**@type {HTMLAnchorElement}*/ (document.querySelector(
                "nav[aria-label=\"Main Menu\"] a[href^=\"/blog/paginated\"]"
            ));
            blogsNavLink.href = "/blog/paginated?" + urlSP.toString();
        }
        // @ts-ignore
        return searchParams;
    }

    /**
     * @param {{
     *      direction: "newer" | "older", cursor: string, limit: number | string
     * }} curSP - current search params (i.e. think of it as search params currently written on the address bar of the browser)
     * @param {*} curResult - result of fetch based on curSP.
     * @returns {HTMLDivElement}
     */
    function createElementForPaginationControls(curSP, curResult) {
        const currentPage = curResult.current;
        const pagesBeyondInSameDirection = curResult.beyond;

        const controlEl = document.createElement("div");
        controlEl.setAttribute("dir", "rtl");
        controlEl.classList.add("pagination-controls", "to-reveal");
        let ih = "";

        if (curSP.cursor === "newest" || (curSP.direction === "newer" && pagesBeyondInSameDirection == null)) {
            // Do nothing
            // don't add link button for fetching & displaying next page of newer blogs, since there is none.
        }
        else {
            //  If direction=newer in current query params (which led to fetching [current] page), then the tail
            //  cursor of current fetched page should be used. Otherwise, head cursor.

            const cursorForGettingNewer = curSP.direction === "newer" ? currentPage.tailCursor : currentPage.headCursor;

            const searchParams = new URLSearchParams({
                direction: "newer",
                limit: curSP.limit + "",
                cursor: cursorForGettingNewer + "",
            });
            ih += /*html*/`
                <a href="/blog/paginated?${searchParams.toString()}" title="بلاگ‌های جدیدتر" data-link>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </a>
            `;
        }

        // Same procedure for button for fetching & displaying next page of older posts...
        if (curSP.cursor === "oldest" || (curSP.direction === "older" && pagesBeyondInSameDirection == null)) {
            // Do nothing
        }
        else {
            const cursorForGettingOlder = curSP.direction === "older" ? currentPage.tailCursor : currentPage.headCursor;

            const searchParams = new URLSearchParams({
                direction: "older",
                limit: curSP.limit + "",
                cursor: cursorForGettingOlder + "",
            });
            ih += /*html*/`
                <a href="/blog/paginated?${searchParams.toString()}" title="بلاگ‌های قدیمی‌تر" data-link>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </a>
            `;
        }

        //  Now let's also add button for first and last page.
        //  There are some edges cases, like when number of total blogs in db is less one page. We don't care
        //  about this case.

        if (curSP.cursor !== "newest" /*if not already in first page*/) {
            ih = /*html*/`
                <a href="/blog/paginated?direction=older&limit=${curSP.limit}&cursor=newest" title="جدیدترین بلاگ‌ها" data-link>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
                    </svg>
                </a>
            ` + ih;
        }

        if (curSP.cursor !== "oldest" /*if not already in last page*/) {
            ih = ih + /*html*/`
                <a href="/blog/paginated?direction=newer&limit=${curSP.limit}&cursor=oldest" title="قدیمی‌ترین بلاگ‌ها" data-link>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
                    </svg>
                </a>
            `;
        }
        controlEl.innerHTML = ih;
        return controlEl;
    }
}

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").FetchBlogPaginated} FetchBlogPaginated
 */
