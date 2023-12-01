import express from "express";
import makeExpressCallback from "#utils/express-callback.js";
import { verificationController } from "#controllers";

const authRouter = express.Router();

authRouter.all("/verification-code", makeExpressCallback(verificationController));

export { authRouter };
