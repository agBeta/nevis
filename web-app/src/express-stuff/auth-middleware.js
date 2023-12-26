import log from "#utils/log.js";
import { find_session_record_by_hashedSessionId } from "../data-access/index.js";


export const requireAuthentication = makeRequireAuthenticationMiddleware({
    find_session_record_by_hashedSessionId
});


/** @param {{ find_session_record_by_hashedSessionId: Find_Session_Record_By_HashedSessionId }} param0 */
export function makeRequireAuthenticationMiddleware({ find_session_record_by_hashedSessionId }) {
    return requireLogin;

    /**
     * @param {ExpressRequest} req
     * @param {ExpressResponse} res
     * @param {ExpressNextFunc} next
     */
    async function requireLogin(req, res, next) {
        const hashedSessionId = req.cookies["__Host-nevis_session_id"];
        if (!hashedSessionId) {
            res.set("Content-Type", "application/json").status(401).send(JSON.stringify({
                success: false,
                error: "Not authenticated."
            }));
            return;
        }

        try {
            const session = await find_session_record_by_hashedSessionId({ hashedSessionId });

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
