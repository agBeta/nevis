import path from "node:path";
import * as http from "node:http";
import helmet from "helmet";
// This must precede the rest of imports.
import "./config.js";
import { installRouter, installMorgan, makeExpressApp } from "./express-stuff/server.js";
import { router as authRouter } from "./routes/auth-router.js";
import { router as blogRouter } from "./routes/blog-router.js";
import { router as filesRouter } from "./routes/files-router.js";

const __dirname = new URL(".", import.meta.url).pathname;

const app = makeExpressApp();
app.set("trust proxy", true);
app.set("case sensitive routing", false);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "client"));

app.use(helmet({
    contentSecurityPolicy: false,
}));

installMorgan({ app });
installRouter({ app, router: authRouter, pathPrefix: "/api/v1/auth" });
installRouter({ app, router: blogRouter, pathPrefix: "/api/v1/blog" });

app.use("/", filesRouter);

const PORT = process.env.PORT;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Hello on port ${PORT}`);
});
