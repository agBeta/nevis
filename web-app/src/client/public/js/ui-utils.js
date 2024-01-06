/** @param {HTMLElement} insideEl @param {boolean} visibility  */
export function showHideLoadingSpinner(insideEl, visibility) {
    if (visibility) {
        insideEl.setAttribute("aria-busy", "true");
        insideEl.innerHTML += /*html*/`
            <div class="loading-container">
                <span class="loading-spinner"></span>
            </div>
        `;
    } else {
        insideEl.setAttribute("aria-busy", "false");
        const loaderEl = insideEl.querySelector(".loading-container");
        loaderEl?.remove();
    }
}

export function updateMainMenuItemsBasedOnUserLoggedIn(){
    const roleCookie = document.cookie.split("; ").find(c => c.startsWith("__Host-nevis_role"));
    const role = roleCookie ? roleCookie.split("=")[1] : null;

    const menuUlElement = /**@type {HTMLUListElement}*/ (document.querySelector("nav[aria-label='Main Menu'] ul"));

    if (role === "user" /*logged in*/) {
        menuUlElement.innerHTML = /*html*/`
            <li class="nav-item to-reveal">
                <a href="/" data-link>
                    <span>۰۱</span>/ خانه
                </a>
            </li>
            <li class="nav-item to-reveal">
                <a href="/blog/paginated" data-link>
                    <span>۰۲</span>/ نوشته‌ها
                </a>
            </li>
            <li class="nav-item to-reveal">
                <a href="/post-blog" data-link>
                    <span>۰۳</span>/ افزودن نوشته
                </a>
            </li>
            <li class="nav-item to-reveal">
                <a href="/logout" data-link>
                    <span>۰۴</span>/ خروج
                </a>
            </li>
        `;
    }
    else {
        // User isn't logged in. So we shouldn't display post-blog and logout.
        menuUlElement.innerHTML = /*html*/`
            <li class="nav-item to-reveal">
                <a href="/" data-link>
                    <span>۰۱</span>/ خانه
                </a>
            </li>
            <li class="nav-item to-reveal">
                <a href="/blog/paginated" data-link>
                    <span>۰۲</span>/ نوشته‌ها
                </a>
            </li>
            <li class="nav-item to-reveal">
                <a href="/signup" data-link>
                    <span>۰۳</span>/ ثبت‌نام
                </a>
            </li>
            <li class="nav-item to-reveal">
                <a href="/login" data-link>
                    <span>۰۴</span>/ ورود
                </a>
            </li>
        `;
    }
}
//
