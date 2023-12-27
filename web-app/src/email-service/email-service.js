import nodemailer from "nodemailer";
import log from "#utils/log.js";


/**
 * @param {{ [key: string]: string|undefined }} param0
 * @returns {EmailService}
 */
export default function makeEmailService({
    mailServiceHost,
    mailServicePort,
    mailServiceUser,
    mailServicePassword,
    mailServiceFromAddress
}) {

    const transporter = process.env.NODE_ENV === "test" ? null :
        // Need type casting to suppress ts errors. See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35847.
        nodemailer.createTransport(/** @type {TransportOptions} */({
            host: mailServiceHost,
            port: Number(mailServicePort),
            tls: true,
            auth: {
                user: mailServiceUser,
                pass: mailServicePassword,
            }
        }));

    //  Why not just `return sendEmail;` ?
    //  Because then it would be almost impossible to mock email sending in our integration tests.
    //  See test.md from self-documentation.
    //  In addition, returning this way it will be easier to extend email service to contain other functionalities,
    //  like using a ring buffer to prevent from being rate limited by mail host, etc.

    //  NOTE: Don't freeze, so that properties can be mocked.
    return {
        sendEmail
    };


    /** @param {{ email: string, subject: string, body: string}} param0 */
    async function sendEmail({ email, subject, body }) {
        log({
            level: "info",
            keyword: "send_email",
            message: `To: ${email} with subject: ${subject}`
        });
        if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
            // Do nothing.
        }
        else {
            try {
                // @ts-ignore
                await transporter.sendMail({
                    from: mailServiceFromAddress,
                    to: email,
                    subject: subject,
                    html: body
                });
            }
            catch (err) {
                log({
                    level: "error",
                    keyword: "failed-email",
                    message: `to ${email} with subject: ${subject}`
                });
            }
        }
    }

}


/**
 * @typedef {import("nodemailer").TransportOptions} TransportOptions
 * @typedef {import("#types").EmailService} EmailService
 */
