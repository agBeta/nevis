import { getValueOfRoleCookie } from "./utils.js";

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

export function updateMainMenuItemsBasedOnUserLoggedIn() {
    const role = getValueOfRoleCookie();

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
                <a href="/add-blog" data-link>
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


/** @param {Element} _el  */
export function registerListenerToDisplayErrorForInvalidInput(_el) {
    const el = /**@type {HTMLInputElement}*/(_el);  // to suppress ts
    const containingFormGroupEl = /**@type {HTMLDivElement}*/(el.parentElement);

    ["change", "blur"].forEach(type => {
        el.addEventListener(type, () => {
            containingFormGroupEl.removeAttribute("data-error");
            // According to https://stackoverflow.com/questions/11586980/is-it-possible-to-trigger-an-event-when-a-field-is-valid-html5
            const isValid = el.value.length > 0 && el.checkValidity(); // This will check all minlength, type="email", etc.
            if (!isValid) {
                containingFormGroupEl.setAttribute("data-error", "ورودی نامعتبر است.");
            }
        });
    });
}


let /**@type {any}*/ hideTimeoutId;

/** @param {{ text: string, kind: "success" | "failure" }} param0 */
export function showToast({ text, kind }) {
    const toastEl = /**@type {HTMLDivElement}*/(document.querySelector(".toast"));
    toastEl.className = `toast toast--${kind}`;
    toastEl.textContent = text;
    toastEl.setAttribute("aria-hidden", "false");

    //  If there is another call of showToast(..) in less than 4 seconds, we don't want to incorrectly
    //  hide the new content of the toast (inside setTimeout).
    if (hideTimeoutId != null) {
        clearTimeout(hideTimeoutId);
    }

    hideTimeoutId = setTimeout(() => {
        toastEl.setAttribute("aria-hidden", "true");
        //  Don't do (toastEl.textContent = "";) here. This will make toast small and destroy the beauty
        //  of fade out animation. If you want to do that, wrap it inside another setTimeout.
        hideTimeoutId = null;
    }, 4000 + (text.length / 120));
}

//
