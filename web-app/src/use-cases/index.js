import { randomBytes } from "node:crypto";
import makeVerificationService from "./verification-service.js";
import emailService from "./email-service.js";
import { codeDb } from "../data-access/index.js";


/** @version 1.0 */
const verificationService = makeVerificationService({
    codeDb,
    emailService,
    /** @returns A random code with length of 6 composed of [a-z,0-9] */
    generateCode: function() {
        //  Don't use Math.random() or timestamp. See https://stackoverflow.com/a/14869745 for a detailed explanation.
        return Promise.resolve(randomBytes(3).toString("hex"));
    }
});

export { verificationService };


