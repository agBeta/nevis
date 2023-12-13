import { randomBytes } from "node:crypto";
import { AppError } from "#utils/errors.js";

/**
 * @param {{ codeDb: CodeDataAccess, emailService: EmailService }} injections
 * @returns {CodeService}
 */
export default function makeCodeService({ codeDb, emailService }) {

    return Object.freeze({
        generateCode,
        storeInDbAndSendCode,
        verifyCode
    });

    /** @type {() => Promise<string>} */
    function generateCode() {
        //  Don't use Math.random() or timestamp. See https://stackoverflow.com/a/14869745 for a detailed explanation.
        return Promise.resolve(randomBytes(3).toString("hex"));
    }

    async function storeInDbAndSendCode(/** @type {string} */ email, /** @type {string} */ code) {
        //  First insert in db. If insertion is successful then try to send. There is no point in sending the code
        //  if we fail to store it in db.
        //  This is the reason we didn't split this function into two smaller functions. We don't want the consumer
        //  of this service to be able to store a code in db without sending it, or to send a code without storing it
        //  in db.
        await codeDb.doInsert({ email, code });

        const subject = "کد تایید";
        const body = "کد تایید شما برابر".concat(" <strong>" + code + "</strong> ").concat("می‌باشد" + ".")
            .concat(" ").concat("این کد برای مدت").concat(" " + "10" + " ").concat("دقیقه معتبر می‌باشد" + ".");

        await emailService.send({ email, subject, body });
    }

    async function verifyCode(/** @type {string} */ email, /** @type {string} */ code) {
        const results = await codeDb.doFindAll({ email });
        if (!results) return false;
        for (const el of results){
            if (el.code === code) {
                return true;
            }
        }
        return false;
    }
}

/**
 * @typedef {import("#types").CodeService} CodeService
 * @typedef {import("#types").CodeDataAccess} CodeDataAccess
 * @typedef {import("#types").EmailService} EmailService
 */
