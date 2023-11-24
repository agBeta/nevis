import express from "express";
import makeExpressCallback from "#utils/express-callback.js";
import { makeEndpointController as makeVerificationCodeEndpointController } from "#controllers/auth/verification-code.js";

const authRouter = express.Router();

authRouter.post("/verification-code", makeExpressCallback());

export { authRouter };
