/** @type {import("#types").EmailService} */
export default Object.freeze({
    /**
     * Sends email
     * @param {{ email: string, subject: string, body: string }} properties
     * @returns {Promise<void>}
     */
    send: async function ({ email, subject, body }) {
        console.log(process.env.NODE_ENV);
        console.log(`Sending email to ${email}`);
        console.log(`subject: ${subject}`);
        console.log(`body: ${body}`);

        if (process.env.NODE_ENV !== "dev" && process.env.NODE_ENV !== "test"){
            // @todo TODO use node-mailer
        }
    }
});
