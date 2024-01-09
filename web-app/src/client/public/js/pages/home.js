import { toggleRevealOfMenu, toggleRevealOfPageElements } from "../reveal-animation.js";

/** @returns {PageView} */
export default function makeHomeView() {
    const pageEl = /**@type {HTMLElement}*/ (document.querySelector("#page"));
    const THIS_VIEW = "home_view";

    return Object.freeze({
        render,
        NAME: THIS_VIEW,
    });

    async function render() {
        document.title = "خانه";
        pageEl.innerHTML = "";
        pageEl.setAttribute("aria-hidden", "false");
        document.querySelectorAll("nav[aria-label='Main Menu'] .nav-item > a").forEach(el => {
            // @ts-ignore
            if (el.pathname === "/") el.setAttribute("aria-current", "page");
            else el.removeAttribute("aria-current");
        });

        toggleRevealOfMenu(false);

        const containerEl = document.createElement("div");
        containerEl.classList.add("to-reveal");
        containerEl.id = "home";
        containerEl.innerHTML = /*html*/`
            <h1 class="h1">خانه</h1>
            <p dir="rtl">خوش آمدید!</p>
            <p dir="rtl">
            اسامی تمامی کاربران و همچنین عناوین و مطالب همه بلاگ‌ها مصنوعی بوده و توسط پکیج
                <span class="en" dir="ltr">Faker</span>
                تولید و به دیتابیس اضافه شده است.
            </p>
        `;
        pageEl.appendChild(containerEl);
        toggleRevealOfPageElements(true);
    }
}

/**
 * @typedef {import("../types.d.ts").PageView} PageView
 */
