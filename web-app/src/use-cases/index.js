import makeCodeService from "./code-service.js";
import emailService from "./email-service.js";
import { codeDb } from "../data-access/index.js";


/** @version 1.0 This service transports generated code via email. We may use mobile phone in future versions. */
const codeService = makeCodeService({ codeDb, sendEmail: emailService.send });

export { codeService };


