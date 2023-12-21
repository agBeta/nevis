import express from "express";
import makeExpressCallback from "../express-stuff/express-callback.js";
import {
    postAction,
    postAuthCode,
    postSignup,
} from "#controllers";

const router = express.Router();

// middleware
router.use("/", express.json({ limit: "20kb" }));


router.post("/code", makeExpressCallback(postAuthCode));

router.post("/signup", makeExpressCallback(postAction));
router.put("/signup/action/:actionId", makeExpressCallback(postSignup));
router.get("/")


export { router };
