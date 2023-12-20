import express from "express";
import morgan from "morgan";
import log from "#utils/log.js";

export function makeExpressApp() {
    const app = express();
    return app;
}

/**
 * Installs the router middleware for given pathPrefix
 * @param {{ app: ExpressApp, router: ExpressRouter, pathPrefix: string }} props
 */
export function installRouter({ app, router, pathPrefix }) {
    if (!pathPrefix.startsWith("/")) {
        throw new Error("Failed to install router. pathPrefix must start with slash(/).");
    }
    app.use(pathPrefix, router);
}

/**
 * Installs morgan middleware on app
 * @param {{ app: ExpressApp }} props
 */
export function installMorgan({ app }) {
    app.use(morgan(
        function (tokens, req, res) {
            return [
                tokens.method(req, res),
                tokens.url(req, res), " ---",
                tokens.status(req, res), "-",
                (tokens.res(req, res, "content-length") ?? "0").concat(" bytes -"),
                (tokens["response-time"](req, res) ?? "0").concat(" ms")
            ].join(" ");
        },
        {
            //  According to the comment by Devon Sams in https://stackoverflow.com/a/28824464/0 and
            //  https://github.com/expressjs/morgan#morganformat-options.
            stream: {
                write: function (str) {
                    log({
                        level: "http",
                        keyword: "morgan",
                        // to remove trailing \n
                        message: str.slice(0, -1)
                    });
                }
            },
            immediate: false,
            skip: function (req, res) { return res.statusCode >= 500; }
        })
    );
}


/**
 * @typedef {import("#types").ExpressApp} ExpressApp
 * @typedef {import("#types").ExpressRouter} ExpressRouter
 */
