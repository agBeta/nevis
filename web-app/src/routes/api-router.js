import express from "express";
import makeExpressCallback from "../express-stuff/express-callback.js";
import {
    postAuthCode
} from "#controllers";

const router = express.Router();

// Middlewares
router.use("/auth", express.json({ limit: "20kb" }));

router.post("/auth/code", makeExpressCallback(postAuthCode));

router.post("/auth/register", underConstruction);
router.post("/auth/login", underConstruction);
// return authenticated user payload if session cookie is present
router.get("/auth", underConstruction);



// router.all("/", makeExpressCallback)


/**
 * @param {import("#types").ExpressRequest} req
 * @param {import("#types").ExpressResponse} res
 */
function underConstruction (req, res) {
    res.send(404).json({ success: false, error: "under construction" });
}


export { router };
