/** @param {HTMLElement} insideEl @param {boolean} visibility  */
export function showHideLoadingSpinner(insideEl, visibility) {
    if (visibility) {
        insideEl.setAttribute("aria-busy", "true");
        insideEl.innerHTML += /*html*/`
            <div class="loading-container to-reveal active">
                <span class="loading-spinner"></span>
            </div>
        `;
    } else {
        insideEl.setAttribute("aria-busy", "false");
        const loaderEl = insideEl.querySelector(".loading-container");
        //  If you don't want to display un-reveal animation, simply call loaderEl.remove(). But
        //  we want to have animation. So...
        loaderEl?.classList.remove("active");
        //   Don't use double rAF, since it would still disappear in a flash of light.
        setTimeout(() => { loaderEl?.remove(); }, 200);
    }
}


export function createErrorElement({ title, description, buttonTitle, onButtonClick }) {
    const errorEl = document.createElement("div");
    errorEl.innerHTML = /*html*/`
        <h2 class="error-title">${title}</h2>
        <p>${description}</p>
    `;
    errorEl.classList.add("error-container", "to-reveal");
    if (buttonTitle) {
        const button = document.createElement("button");
        button.textContent = buttonTitle;
        button.addEventListener("click", onButtonClick);
        errorEl.appendChild(button);
    }
    setTimeout(() => errorEl.classList.add("active"), 300);
    return errorEl;
}

//
