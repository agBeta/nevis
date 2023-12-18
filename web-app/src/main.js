import path from "node:path";
import * as http from "node:http";
// This must precede the rest of imports.
import "./config.js";
import { installRouter, installMorgan, makeExpressApp } from "./express-stuff/server.js";
import { router as authRouter } from "./routes/auth-router.js";
import { router as filesRouter } from "./routes/files-router.js";

const __dirname = new URL(".", import.meta.url).pathname;

const app = makeExpressApp();
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "client"));

installMorgan({ app });
installRouter({ app, router: authRouter, pathPrefix: "/api/v1/auth" });

app.use("/", filesRouter);

const PORT = process.env.PORT;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Hello on port ${PORT}`);
});


const Id = Object.freeze({
    createId: init({ length: 24 }),
    isValidId: isCuid
});
