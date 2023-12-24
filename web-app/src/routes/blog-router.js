import express from "express";
import makeExpressCallback from "../express-stuff/express-callback";


const router = express.Router();

router.use("/", express.json({
    // How? See json-size-kb.js in playground.
    limit: "50kb"
}));

// (semi-?)idempotent POST
router.post("/", makeExpressCallback())

export { router };
