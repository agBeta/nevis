import { codeService } from "../use-cases/index.js";
import { makeEndpointController as makePostAuthCodeController } from "./auth-code-post.js";


const postAuthCode = makePostAuthCodeController({ codeService });

export { postAuthCode };
