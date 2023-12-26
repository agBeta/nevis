import { RateLimiterMemory } from "rate-limiter-flexible";


/** @param {{ duration: number, points: number, name: string }} param0 */
export function makeRateLimitMiddleware({ duration, points, name }) {
    //  For simplicity, we don't use redis or cluster.
    //  Although it is flaky. If periodically some instances of application are teared down and setup again, and the
    //  requests from same source go to the newly setup instance, then we may never get the chance to rate limit this
    //  source. It is better to use Redis as soon as possible. Anyway, for simplicity...
    const limiter = new RateLimiterMemory({
        points,
        duration,
        //  Don't omit this. See https://github.com/animir/node-rate-limiter-flexible/wiki/Options#keyprefix.
        keyPrefix: name,
    });
    return rateLimitMiddleware;

    /**
     * @param {ExpressRequest} req
     * @param {ExpressResponse} res
     * @param {ExpressNextFunc} next
     */
    async function rateLimitMiddleware(req, res, next) {
        if (!req.ip) {
            // Quite rare to reach (like when client is disconnected, etc.). To have consistency we send 429 here too.
            res.status(429)
                .set("Content-Type", "application/json")
                .set("Retry-After", `${duration}`)
                .send(JSON.stringify({ error: "Too Many Requests.", success: false }));
            return;
        }
        limiter.consume(req.ip, 1)
            .then(() => {
                next();
            })
            .catch(() => {
                res.status(429)
                    .set("Content-Type", "application/json")
                    .set("Retry-After", `${duration}`)
                    .send(JSON.stringify({ error: "Too Many Requests.", success: false }));
            });
    }
}

/**
 * @typedef {import("#types").ExpressRequest} ExpressRequest
 * @typedef {import("#types").ExpressResponse} ExpressResponse
 * @typedef {import("#types").ExpressNextFunc} ExpressNextFunc
 */
