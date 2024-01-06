//  At the moment, all state functions are synchronous, but we will probably migrate to IndexedDB or File System
//  API, Cache API, etc.

const StateManagementInterface = Object.freeze({
    setSate,
    getState,
    clearStates: function() {
        localStorage.clear();
    },
    // Some helper functions, in order to have single source of truth for essential key names.
    setCurrentViewOnScreen: function (/**@type {string}*/nameOfView, /**@type {number}*/timestamp) {
        setSate("current_view_on_screen", {
            name: nameOfView,
            timestamp,
        });
    },
    getCurrentViewOnScreen: function () {
        const v = getState("current_view_on_screen");
        if (v == null) return { name: "", timestamp: -1 };
        // @ts-ignore
        return { name: v.name, timestamp: v.timestamp, };
    }
});
window.SMI = StateManagementInterface; // making it public


/** @param {string} key @param {object} value @returns {boolean} */
function setSate(key, value) {
    try {
        if (value == null) {
            localStorage.setItem(key, "");
            return true;
        }
        const v = JSON.stringify(value);
        localStorage.setItem(key, v);
        return true;
    }
    catch (e) {
        // Do nothing else (for now). We may add a retry logic, etc in future versions.
        return false; // unsuccessful
    }
}

/** @param {string} key @returns {object|null} */
function getState(key) {
    try {
        let v = localStorage.getItem(key);
        if (v == null) return null;
        return JSON.parse(v);
    }
    catch (e) {
        // Do nothing else (for now).
        return null;
    }
}

