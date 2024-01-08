import Joi from "joi";
import makeBasicValidateNormalize from "../validate-normalize.js";


/**
 * POST /auth/code endpoint controller isn't idempotent. Just for simplicity.
 * @param {{
 *      insert_code: Insert_Code,
 *      generateCode: () => string,
 *      emailService: EmailService,
 *      createSecureHash: (plain: string) => Promise<string>
 * }} param0
 * @returns {Controller}
 */
export function makeEndpointController({
    insert_code,
    generateCode,
    emailService,
    createSecureHash,
}) {

    return Object.freeze({
        handleRequest,

        validateRequest: makeBasicValidateNormalize({
            schemaOfBody: Joi.object({
                email: Joi.string().email({ allowUnicode: true }).max(80).required(),
                purpose: Joi.string().min(3).max(20).valid("signup", "reset-password")
            })
        })
    });


    async function handleRequest(/** @type HttpRequest */ httpRequest) {
        // @ts-ignore
        const /** @type {string} */ email = httpRequest.body.email;
        // @ts-ignore
        const /** @type {string} */ purpose = httpRequest.body.purpose;

        const code = process.env.NODE_ENV === "e2e" ? "123abc" : generateCode();
        // Must also hash this short-lived code before storing in db. See comment at the end of this file.
        // Maybe it would be better to also include client IP to create hashed code. But let's keep it simple.
        const hashedCode = await createSecureHash(code);
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes later

        //  Don't remove already existing codes related to this email address. See comment at the end of this file.
        await insert_code({ email, hashedCode, purpose, expiresAt });

        const subject = "کد تایید";
        const body = "کد تایید شما برابر".concat(" <strong>" + code + "</strong> ").concat("می‌باشد" + ".")
            .concat(" ").concat("این کد برای مدت").concat(" " + "10" + " ").concat("دقیقه معتبر می‌باشد" + ".");

        await emailService.sendEmail({ email, subject, body });

        return {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
            },
            statusCode: 201,
            payload: JSON.stringify({ success: true })
        };
    }
}

/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 * @typedef {import("#types").EmailService} EmailService
 * @typedef {import("#types").Insert_Code} Insert_Code
 */


/*
    If an attacker has read access to the database (SQL-injection), he could request a reset for any account he
    wants, even for admin accounts. Because he can see the new generated token, he could take over this account.
    Based on https://security.stackexchange.com/questions/86913/should-password-reset-tokens-be-hashed-when-stored-in-a-database.
*/

/*
    We don't remove already existing codes related to this email address, and there is a good reason behind it.
    See comments by [John] and [caw] below this SO answer https://security.stackexchange.com/a/31507.
*/
