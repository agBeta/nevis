import express from "express";
import makeExpressCallback from "../express-stuff/express-callback.js";
import { makeRateLimitMiddleware } from "../express-stuff/rate-limit-middleware.js";
import {
    auth_code_POST,
    auth_login_POST,
    auth_signup_POST,
    auth_authenticated_as_GET,
} from "#controllers";

const router = express.Router();

router.use(express.json({ limit: "10kb" }));

router.use(makeRateLimitMiddleware({
    duration: 3600,
    points: 100,
    name: "rt_auth_all_" + (process.env.APP_ID ?? "default"),
}));
router.get("/authenticated_as", makeExpressCallback(auth_authenticated_as_GET));

router.use(makeRateLimitMiddleware({
    duration: 3600,
    points: 20,
    name: "rt_auth_" + (process.env.APP_ID ?? "default"),
}));
router.post("/code", makeExpressCallback(auth_code_POST));
router.post("/signup", makeExpressCallback(auth_signup_POST));
router.post("/login", makeExpressCallback(auth_login_POST));


export { router };
