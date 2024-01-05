import { toggleRevealOfPageElements } from "../reveal-animation.js";
import { createErrorElement, showHideLoadingSpinner } from "../ui-utils.js";

/** @param {{ fetchBlogPaginated: FetchBlogPaginated }} param0 @returns {PageView} */
export default function makeBlogsView({
    fetchBlogPaginated,
}) {
    const sectionEl = /**@type {HTMLElement}*/(document.getElementById("blogs"));
    let /**@type {"loading"|"free"}*/ ongoingDisplayState;
    const THIS_VIEW = "blogs_view";

    return Object.freeze({
        render: safelyRender,
        NAME: THIS_VIEW,
    });

    async function safelyRender(/**@type {any}*/ params) {
        try {
            await render(params);
        }
        catch (err) {
            const isUserCurrentlyAtThisPage = window.SMI.getCurrentViewOnScreen() === THIS_VIEW;

            // App might be crashed while loading data from server, etc. So we first check:
            if (ongoingDisplayState === "loading") {
                if (isUserCurrentlyAtThisPage) {
                    showHideLoadingSpinner(sectionEl, false);
                }
            }
            ongoingDisplayState = "free";

            if (isUserCurrentlyAtThisPage) {
                const errorEl = createErrorElement({
                    title: "خطا",
                    description: err.message ?? "Unknown Error",
                    buttonTitle: "تلاش مجدد",
                    onButtonClick: () => {
                        errorEl.remove();
                        safelyRender(params);
                    }
                });
                sectionEl.appendChild(errorEl);
            }
        }
    }

    async function render(/** @type {any} */params) {
        document.title = "نوشته‌ها";
        sectionEl.innerHTML = "";
        sectionEl.setAttribute("aria-hidden", "false");
        sectionEl.setAttribute("aria-live", "polite");
        sectionEl.classList.add("active");
        ongoingDisplayState = "loading";
        showHideLoadingSpinner(sectionEl, true);

        //  The user might have navigated to another page, then come back to this page by clicking on nav-item.
        //  If the user clicks on nav-item, the params will be empty, but we want to continue from the page that
        //  was recently displayed. So ...
        const recentSearchParams = window.SMI.getState(THIS_VIEW);
        if (params == null || Object.keys(params).length === 0) {
            params = recentSearchParams ?? {}/*<-- so that params.cursor below won't throw error*/;
        } else {
            //  So we actually have some params. Here, we don't care if params are valid or not. The consumer
            //  of this state will later decided to whether clean/error when params are invalid. Anyway...
            window.SMI.setSate(THIS_VIEW, params);
        }

        const cursor = params.cursor ?? "newest";
        const direction = params.direction ?? "older";
        const limit = Number(params.limit ?? 10);
        // await new Promise((rs, rj) => setTimeout(rs, 10 * window.MAX_ANIMATION_TIME));
        const result = await fetchBlogPaginated({ cursor, direction, limit });

        showHideLoadingSpinner(sectionEl, false);
        ongoingDisplayState = "free";

        if (result.statusCode !== 200) {
            throw new Error(result.statusCode + " " + result.body.error);
        }
        sectionEl.innerHTML = /*html*/`
            <h1 class="h1">نوشته‌ها</h1>
        `;

        const /**@type {import("#types").PaginatedResult}*/ current = result.body.current;

        const listElOfCurrent = document.createElement("ol");
        listElOfCurrent.classList.add("list", "u-flow-content");

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

        const paginationControlEl = createElementForPaginationControls({ cursor, limit, direction }, result.body);

        //  It's better to attack controls elements first. User can easily move many pages without the need to scroll down every time.
        sectionEl.appendChild(paginationControlEl);
        sectionEl.appendChild(listElOfCurrent);
        toggleRevealOfPageElements(true, ".blog-item");
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
        controlEl.classList.add("pagination-controls");
        let h = "";

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
            h += /*html*/`
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
            console.log(cursorForGettingOlder);

            const searchParams = new URLSearchParams({
                direction: "older",
                limit: curSP.limit + "",
                cursor: cursorForGettingOlder + "",
            });
            h += /*html*/`
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
            h = /*html*/`
                <a href="/blog/paginated?limit=${curSP.limit}&cursor=newest&direction=older" title="جدیدترین بلاگ‌ها" data-link>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13 17l5-5-5-5M6 17l5-5-5-5"/>
                    </svg>
                </a>
            ` + h;
        }

        if (curSP.cursor !== "oldest" /*if not already in last page*/) {
            h = h + /*html*/`
                <a href="/blog/paginated?limit=${curSP.limit}&cursor=oldest&direction=newer" title="قدیمی‌ترین بلاگ‌ها" data-link>
                    <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5"/>
                    </svg>
                </a>
            `;
        }
        controlEl.innerHTML = h;
        return controlEl;
    }
}

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 * @typedef {import("../types.d.ts").FetchBlogPaginated} FetchBlogPaginated
 */
