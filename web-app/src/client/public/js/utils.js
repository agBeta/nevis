/** @returns {string} */
export function getValueOfRoleCookie(){
    const roleCookie = document.cookie.split("; ").find(c => c.startsWith("__Host-nevis_role"));
    const role = roleCookie ? roleCookie.split("=")[1] : "";
    return role;
}
