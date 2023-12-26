import express from "express";
import makeExpressCallback from "../express-stuff/express-callback.js";
import {
    auth_code_POST,
    auth_login_POST,
    auth_signup_POST,
    auth_authenticated_as_GET,
} from "#controllers";

const router = express.Router();

// middleware
router.use(express.json({ limit: "10kb" }));
router.get("/authenticated_as", makeExpressCallback(auth_authenticated_as_GET));

router.post("/code", makeExpressCallback(auth_code_POST));
router.post("/signup", makeExpressCallback(auth_signup_POST));
router.post("/login", makeExpressCallback(auth_login_POST));


export { router };
