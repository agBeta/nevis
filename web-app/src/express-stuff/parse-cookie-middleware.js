// We don't use cookieParser.

/** @param {ExpressRequest} req @param {ExpressResponse} res @param {ExpressNextFunc} next */
export default function (req, res, next) {
    try {
        const cookieHeader = req.headers.cookie;
        if (cookieHeader && cookieHeader.length >= 1000) {
            throw new Error(
                "How can cookie become this long?! Is someone attacking us? "
                + `from IP ${req.ip}  `
                + cookieHeader
            );
        }
        if (cookieHeader && cookieHeader.length > 1) {
            req.cookies = {};
            const cookies = cookieHeader.split(";")
                /* if we don't trim, after first cookie they will all have extra white space at the beginning. */
                .map(s => s.trim());

            for (let c of cookies) {
                const [name, value] = c.split("=");
                req.cookies[name] = value;
            }
            Object.freeze(req.cookies);
        }
    }
    catch (err) {
        //  We wrapped inside try/catch just to prevent bubbling up any errors that might happen
        //  during parsing cookies.
        res.status(500).json({
            // Use the same error message from express-callback so that no info will be leaked.
            error: "An unknown error occurred on the server.",
        });
        return;
    }
    next();
}

/**
 * @typedef {import("#types").ExpressRequest} ExpressRequest
 * @typedef {import("#types").ExpressResponse} ExpressResponse
 * @typedef {import("#types").ExpressNextFunc} ExpressNextFunc
 */
