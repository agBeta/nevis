import path from "node:path";
import { createServer } from "node:http";
import express from "express";
import dotenv from "dotenv";
import { router as apiRouter } from "./routes/api-router.js";
import { router as filesRouter } from "./routes/files-router.js";
import morgan from "morgan";
import log from "#utils/log.js";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const app = express();
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "client"));


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
        //  According to the comment by Devon Sams in https://stackoverflow.com/a/28824464/22969951 and
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


app.use("/api", apiRouter);
app.use("/", filesRouter);

const PORT = process.env.PORT;
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Hello on port ${PORT}`);
});

export { server };
