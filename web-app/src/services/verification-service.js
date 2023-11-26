import { AppError } from "#utils/errors.js";

/**
 * @param {{ codeDb: CodeDataAccess,
 *           emailService: EmailService,
 *           generateCode: () => Promise<string>
 *         }} properties
 * @returns {VerificationService}
 */
export default function makeVerificationService({ codeDb, emailService, generateCode }) {

    return Object.freeze({
        createAndSendCode,
        verify
    });

    async function createAndSendCode(/** @type {string} */ email) {
        //  The best email validation approach is just sending the code to the given email.
        //  Don't use regex for email verification. See https://stackoverflow.com/a/1373724 and https://mailoji.com/.

        const code = await generateCode();

        const subject = "کد تایید";
        const body = "کد تایید شما برابر".concat(" <strong>" + code + "</strong> ").concat("می‌باشد" + ".")
            .concat(" ").concat("این کد برای مدت").concat(" " + "10" + " ").concat("دقیقه معتبر میباشد" + ".");

        await emailService.send({ email, subject, body });
        await codeDb.insert({ email, code });
        /** @todo TODO Error handling */
    }

    async function verify(/** @type {string} */ email, /** @type {string} */ code) {
        return true;
    }
}

/**
 * @typedef {import("#types").VerificationService} VerificationService
 * @typedef {import("#types").CodeDataAccess} CodeDataAccess
 * @typedef {import("#types").EmailService} EmailService
 */
