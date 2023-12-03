import { verificationService } from "../use-cases/index.js";
import { makeEndpointController as makeVerificationCodeEndpointController } from "./auth-code.js/index.js";

const verificationController = makeVerificationCodeEndpointController({ verificationService });

export { verificationController };
