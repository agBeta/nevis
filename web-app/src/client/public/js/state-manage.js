//  At the moment, all state functions are synchronous, but we will probably migrate to IndexedDB or File System
//  API, Cache API, etc.

const StateManagementInterface = Object.freeze({
    setSate: safelySetState,
    getState: safelyGetState,
    // Some helper functions, in order to have single source of truth for essential key names.
    setCurrentViewOnScreen: function(/**@type {string}*/nameOfView) {
        safelySetState("current_view_on_screen", { name: nameOfView, /* when: Date.now() */ });
    },
    getCurrentViewOnScreen: function(){
        const v = safelyGetState("current_view_on_screen");
        if (v == null) return "";
        // @ts-ignore
        if (v.name) return v.name;
        return "";
    }
});
window.SMI = StateManagementInterface; // making it public


/** @param {string} key @param {object} value @returns {boolean} */
function safelySetState(key, value) {
    try {
        setSate(key, value);
        return true;
    }
    catch (e) {
        // Do nothing else (for now). We may add a retry logic, etc in future versions.
        return false; // unsuccessful
    }
}

/** @param {string} key @param {object} value */
function setSate(key, value) {
    if (value == null) {
        localStorage.setItem(key, "");
        return;
    }
    const v = JSON.stringify(value);
    localStorage.setItem(key, v);
}

/** @param {string} key @returns {object|null} */
function safelyGetState(key) {
    try {
        const result = getState(key);
        return result;
    }
    catch (e) {
        // Do nothing else (for now).
        return null;
    }
}

/** @param {string} key */
function getState(key) {
    let v = localStorage.getItem(key);
    if (v == null) return null;
    return JSON.parse(v);
}


