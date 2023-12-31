const wraps = [...document.querySelectorAll(".wrap")];
const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const menuWraps = [...document.querySelectorAll(".menu-wrap")];

menuToggle?.addEventListener("click", () => {
    if (menu?.classList.contains("active")) {
        menuToggle.classList.remove("active");
        toggleMenuWraps(false);
        setTimeout(() => {
            menu.classList.remove("active");
        }, 300);
        setTimeout(() => {
            toggleWraps(true);
        }, 300);
    }
    else {
        menuToggle.classList.add("active");
        toggleWraps(false);
        setTimeout(() => {
            menu.classList.add("active");
        }, 300);
        setTimeout(() => {
            toggleMenuWraps(true);
        }, 300);
    }
});

function toggleWraps(active) {
    wraps.forEach(wrap => {
        toggleWrap(wrap, active);
    });
}

function toggleMenuWraps(active) {
    menuWraps.forEach(wrap => {
        toggleWrap(wrap, active);
    });
}

function toggleWrap(wrap, active) {
    setTimeout(() => {
        if (active)
            wrap.classList.add("active");
        else
            wrap.classList.remove("active");
    });
}

function displayWraps() {
    wraps.forEach((wrap, i) => {
        setTimeout(() => {
            wrap.classList.add("active");
        }, (i + 1) * 50);
    });
}


displayWraps();
