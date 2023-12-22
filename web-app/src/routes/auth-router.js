import express from "express";
import makeExpressCallback from "../express-stuff/express-callback.js";
import {
    auth_code_POST,
    generic_action_creation_POST,
    generic_action_status_GET,
    auth_signup_action_PUT,
} from "#controllers";

const router = express.Router();

// middleware
router.use("/", express.json({ limit: "20kb" }));


router.post("/code", makeExpressCallback(auth_code_POST));

router.post("/signup", makeExpressCallback(generic_action_creation_POST));
router.put("/signup/action/:actionId", makeExpressCallback(auth_signup_action_PUT));
router.get("/signup/action/:actionId", makeExpressCallback(generic_action_status_GET));


export { router };
