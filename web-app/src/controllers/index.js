import { codeService, userService } from "../use-cases/index.js";
import { makeEndpointController as makePostAuthCodeController } from "./auth-code-post.js";
import { makeEndpointController as makePostAuthRegisterController } from "./auth-register-post.js";


const postAuthCode = makePostAuthCodeController({ codeService });
const postAuthRegister = makePostAuthRegisterController({ codeService, userService });

export { postAuthCode };
