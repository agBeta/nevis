import log from "#utils/log.js";

/**
 * @type {import("#types").EmailService}
 * Note: Don't freeze the object, as we need to mock/spy it for integration tests.
 */
export default {
    /**
     * Sends email
     * @param {{ email: string, subject: string, body: string }} properties
     * @returns {Promise<void>}
     */
    send: async function ({ email, subject, body }) {
        log({
            level: "info",
            keyword: "send-email",
            message: `to ${email} with subject: ${subject}`
        });

        if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
            log({ level: "info", keyword: "send-email", message: body });
        }
        else {
            /** @todo TODO use node-mailer */
        }
    }
};
