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


export function createErrorElement({ title, description, buttonTitle, onButtonClick }) {
    const errorEl = document.createElement("div");
    errorEl.classList.add("error-container", "to-reveal", "active");

    errorEl.innerHTML = /*html*/`
        <h2 class="error-title">${title}</h2>
        <p>${description}</p>
    `;

    if (buttonTitle) {
        const button = document.createElement("button");
        button.textContent = buttonTitle;
        button.addEventListener("click", onButtonClick);
        errorEl.appendChild(button);
    }
    return errorEl;
}

//
