import path from "node:path";
import express from "express";
import { makeRateLimitMiddleware } from "../express-stuff/rate-limit-middleware.js";

//  Note, there seems to be some gotchas regarding how to correctly obtain __dirname correctly both in Linux and
//  Windows. See node.md in self-documentation.
const __dirname = new URL(".", import.meta.url).pathname;

const router = express.Router();

router.use(makeRateLimitMiddleware({
    duration: 3600,
    // Remember, our index page will send many requests to grab js, css and other assets.
    points: process.env.NODE_ENV === "e2e" ? 5000 : 200,
    name: "rt_files_" + (process.env.APP_ID ?? "default"),
}));

router.use("/public/fonts",
    //  By default, "express.static()" sets Cache-Control to 'public, max-age=0'.But for fonts, we tell browser to
    //  cache them for a long period of time.
    express.static(path.resolve(__dirname, "..", "client", "public", "fonts"), { maxAge: "30d" })
);
router.use("/public", express.static(path.resolve(__dirname, "..", "client", "public")));

// Service worker must be registered on the root path of our domain if we want to control the whole web-app by it.
router.get("/sw.js", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "public", "js", "sw.js"));
});
router.get("/manifest.json", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "public", "manifest.json"));
});


router.get("/*", (req, res) => {

    //  We could have set CSP headers in our web server configuration (e.g. Nginx reverse proxy). But this way we
    //  have more control. We aren't using google fonts or any CDN to load icons, etc. So most of them are 'self'.
    //  For future versions, don't forget to add our image upload server.
    //  Also be ware: Not all directives fallback to default-src (according to https://content-security-policy.com/.)
    const cspHeader = process.env.NODE_ENV === "test" || process.env.NODE_ENV === "e2e"
        ? `default-src 'self'; style-src 'self'; script-src 'self'; font-src 'self'; media-src 'none'; manifest-src 'self'; connect-src 'self' localhost:${process.env.PORT} `
        : "default-src 'self'; style-src 'self'; script-src 'self'; font-src 'self'; media-src 'none'; manifest-src 'self'; connect-src 'self' ";

    res.setHeader("Content-Security-Policy", cspHeader).set("Cache-Control").render("index", {

    });
});


export { router };
