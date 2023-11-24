export class AppError extends Error {
    /**
     * @param {string} message
     */
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, AppError);
    }
}
