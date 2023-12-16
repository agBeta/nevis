import emailService from "./email-service.js";
import makeCodeService from "./code-service.js";
import makeUserService from "./user-service.js";
import { codeDb, userDb } from "../data-access/index.js";


/** @version 1.0 This service transports generated code via email. We may use mobile phone in future versions. */
const codeService = makeCodeService({ codeDb, emailService });

const userService = makeUserService({ userDb });

export {
    codeService,
    userService
};


