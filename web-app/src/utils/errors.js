export class AppError extends Error {
    /**
     * @param {string} message
     */
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AppError);
    }
}


export class InvalidStateError extends Error {
    /**
     * This error means: Refused to continue the method. Continuing will potentially create invalid state in our objects.
     * @param {string} message
     */
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AppError);
    }
}

export class OperationalError extends Error {
    /**
     * This error is caused by external resources, e.g. database connection/query fails, HTTP request fails, etc.
     * @param {string} message
     */
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AppError);
    }
}
