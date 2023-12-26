import path from "node:path";
import express from "express";
import { makeRateLimitMiddleware } from "../express-stuff/rate-limit-middleware.js";

// todo nonce

//  Note, there seems to be some gotchas regarding how to correctly obtain __dirname correctly both in Linux and
//  Windows. See node.md in self-documentation.
const __dirname = new URL(".", import.meta.url).pathname;

const router = express.Router();

router.use(makeRateLimitMiddleware({
    duration: 3600,
    points: 40,
    name: "rt_files_" + (process.env.APP_ID ?? "default"),
}));

router.use("/public/fonts",
    //  By default, "express.static()" sets Cache-Control to 'public, max-age=0'.But for fonts, we tell browser to
    //  cache them for a long period of time.
    express.static(path.resolve(__dirname, "..", "client", "public", "fonts"), { maxAge: "30d" })
);
router.use("/public", express.static(path.resolve(__dirname, "..", "client", "public")));

router.get("/*", (req, res) => {
    res.render("index", {

    });
});

export { router };
