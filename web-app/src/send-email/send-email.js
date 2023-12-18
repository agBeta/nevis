import nodemailer from "nodemailer";
import log from "#utils/log.js";


/**
 * @param {{ [key: string]: string|undefined }} param0
 * @returns
 */
export default function makeSendEmail({
    mailServiceHost,
    mailServicePort,
    mailServiceUser,
    mailServicePassword,
    mailServiceFromAddress
}) {

    // See https://github.com/DefinitelyTyped/DefinitelyTyped/issues/35847.
    const transporter = nodemailer.createTransport(/** @type {TransportOptions} */({
        host: mailServiceHost,
        port: Number(mailServicePort),
        tls: true,
        auth: {
            user: mailServiceUser,
            pass: mailServicePassword,
        }
    }));

    return Object.freeze({
        sendEmail
    });

    /**
     * @param {{ email: string, subject: string, body: string }} properties
     * @returns {Promise<void>}
     */
    async function sendEmail({ email, subject, body }) {

        log({
            level: "info",
            keyword: "send-email",
            message: `to ${email} with subject: ${subject}`
        });

        if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
            // Do nothing.
        }
        else {
            /** @todo TODO add logic to prevent being rate limited */

            try {
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
 */
