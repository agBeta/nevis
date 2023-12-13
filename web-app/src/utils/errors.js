import log from "./log.js";

export class AppError extends Error {
    /**
     * @param {string} message
     */
    constructor(message, keyword="uncategorized") {
        super(message);
        Error.captureStackTrace(this, AppError);
        log({
            level: "error",
            keyword: keyword,
            message: this.stack ?? this.message
        });
    }
}


export class InvalidError extends Error {
    /**
     * This error means: Refused to continue. Continuing will potentially create invalid state in our objects.
     * @param {string} message
     */
    constructor(message) {
        super(message);
        this.name = this.constructor.name /* which is InvalidError in this case */;
        Error.captureStackTrace(this, AppError);
    }
}

export class OperationalError extends Error {
    /**
     * This error is caused by external resources, e.g. database connection/query fails, HTTP request fails, etc.
     * @param {string} message
     */
    constructor(message, keyword="uncategorized") {
        super(message);
        Error.captureStackTrace(this, AppError);
        log({
            level: "error",
            keyword: keyword,
            message: this.stack ?? this.message
        });
    }
}
