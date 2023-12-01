import { verificationService } from "../services/index.js";
import { makeEndpointController as makeVerificationCodeEndpointController } from "./verification-code.js";

const verificationController = makeVerificationCodeEndpointController({ verificationService });

export { verificationController };
