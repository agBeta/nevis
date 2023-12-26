import express from "express";
import makeExpressCallback from "../express-stuff/express-callback";
import { requireAuthentication } from "../express-stuff/auth-middleware.js";
import {
    blog_POST_action_creation,
    blog_action_PUT,
    blog_blogId_GET,
    blog_paginated_GET,
    blog_GET,
} from "#controllers";

const router = express.Router();

router.use("/", express.json({ limit: "12kb" }));

// (semi-?)idempotent POST
router.post("/",
    requireAuthentication,
    makeExpressCallback(blog_POST_action_creation)
);

router.put("/action/:actionId",
    requireAuthentication,
    makeExpressCallback(blog_action_PUT)
);

router.get("/:blogId", makeExpressCallback(blog_blogId_GET));
router.get("/", makeExpressCallback(blog_GET));
router.get("/paginated", makeExpressCallback(blog_paginated_GET));

export { router };
