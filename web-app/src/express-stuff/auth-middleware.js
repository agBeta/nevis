import log from "#utils/log.js";
import { find_session_record_by_hashedSessionId } from "#da/index.js";
import { createFastHash } from "#controllers";

export const requireAuthentication = makeRequireAuthenticationMiddleware({
    calculateHash: createFastHash,
    find_session_record_by_hashedSessionId,
});


/**
 * @param {Object} param0
 * @param {(plain: string) => string} param0.calculateHash - MUST be the same hash function used to hash
 *          sessionId before storing in db (i.e. exactly [createFastHash] used in login-post controller).
 * @param {Find_Session_Record_By_HashedSessionId} param0.find_session_record_by_hashedSessionId
 */
export function makeRequireAuthenticationMiddleware({ calculateHash, find_session_record_by_hashedSessionId }) {
    return requireLogin;

    /**
     * @param {ExpressRequest} req
     * @param {ExpressResponse} res
     * @param {ExpressNextFunc} next
     */
    async function requireLogin(req, res, next) {
        //  req.cookies might be undefined (recall we aren't using cookie-parser which guarantees to
        //  populate req.cookies with something or {}). So "?." is crucial.
        const sessionId = req.cookies?.["__Host-nevis_session_id"];
        if (!sessionId) {
            res.set("Content-Type", "application/json").status(401).send(JSON.stringify({
                success: false,
                error: "Not authenticated."
            }));
            return;
        }

        try {
            const h = calculateHash(sessionId);
            const session = await find_session_record_by_hashedSessionId({ hashedSessionId: h });

            if (!session) {
                res.set("Content-Type", "application/json").status(401).send(JSON.stringify({
                    success: false,
                    error: "Not authenticated."
                }));
                return;
            }

            // @ts-ignore
            req.authenticatedAs = session.userId;
            next();
        }
        catch (err) {
            log({
                level: "error",
                keyword: "auth_mdl",
                message: err.message,
            });
            res.set("Content-Type", "application/json").status(500).send(JSON.stringify({
                success: false,
                // Same error as express-callback.
                error: "An unknown error occurred on the server.",
            }));
        }
    }
}

/**
 * @typedef {import("#types").ExpressRequest} ExpressRequest
 * @typedef {import("#types").ExpressResponse} ExpressResponse
 * @typedef {import("#types").ExpressNextFunc} ExpressNextFunc
 * @typedef {import("#types").Find_Session_Record_By_HashedSessionId} Find_Session_Record_By_HashedSessionId
 */
