/** @returns {string} */
export function getValueOfRoleCookie() {
    const roleCookie = document.cookie.split("; ").find(c => c.startsWith(
        // window.location.hostname.startsWith("localhost") ? "nevis_role" : "__Host-nevis_role"
        "nevis_role"
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


export function clearAllCookies() {
    //  This will clear all cookies in all paths and all cookies within the current domain and
    //  all trailing subdomains.
    //  It's fine, since we don't have any cookies (like ga) but "role", and we don't have any cookies
    //  to track user activity on our website.
    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
        // Trying all pathnames and domains so that we make sure we remove the cookie.
        const hostnameParts = window.location.hostname.split(".");

        while (hostnameParts.length > 0) {
            const cookieName = c.split(";")[0].split("=")[0];
            const v = encodeURIComponent(cookieName
                + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" + hostnameParts.join(".")
                + " ; path="
            );
            const pathnameParts = location.pathname.split("/");
            document.cookie = v + "/";
            while (pathnameParts.length > 0) {
                document.cookie = v + pathnameParts.join("/");
                pathnameParts.pop();
            }
            hostnameParts.shift();
        }
        // By the end of those two nested whiles above, cookie c should already be deleted.
    }
}


/** @param {Function} callback  */
export function makeRetry(
    callback,
    maxAttempts = 3,
    delayBetweenConsecutiveAttempts = 1000,
    backoff = true,
) {
    // Inspired by https://stackoverflow.com/questions/64053084/custom-retry-function.
    let currentAttempt = 1;
    let delay = delayBetweenConsecutiveAttempts;
    /** @type {(...args: any[]) => Promise<any>} */
    const retry = async function (...args) {
        try {
            // There is no need to bind or apply. But don't forget the three dots behind args.
            const result = await callback(...args);
            return result;
        }
        catch (err) {
            //  So either the callback rejected or didn't meet the criteria.
            if (currentAttempt > maxAttempts) {
                throw err; // bubble the error to upstream
            }
            currentAttempt++;
            if (delay > 0) {
                await new Promise((resolve) => setTimeout(resolve, delay));
                if (backoff) delay *= 2;
            }
            return retry(...args);
        }
    };
    return retry;
}
