/** @returns {string} */
export function getValueOfRoleCookie(){
    const roleCookie = document.cookie.split("; ").find(c => c.startsWith(
        window.location.hostname.startsWith("localhost") ? "nevis_role" : "__Host-nevis_role"
    ));
    const role = roleCookie ? roleCookie.split("=")[1] : "";
    return role;
}


/** @param {FormData} fd */
export function convertFD2Json(fd) {
    let obj = {};
    for (let key of fd.keys()) {
        // @ts-ignore
        obj[key] = fd.get(key);
    }
    return obj;
}
