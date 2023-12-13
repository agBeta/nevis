import path from "node:path";
import { createServer } from "node:http";
import express from "express";
import dotenv from "dotenv";
import { router as apiRouter } from "./routes/api-router.js";
import { router as filesRouter } from "./routes/files-router.js";
import morgan from "morgan";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const app = express();
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "client"));

app.use(morgan("dev"));
app.use("/api", apiRouter);
app.use("/", filesRouter);

const PORT = process.env.PORT;
const server = createServer(app);

server.listen(PORT, () => {
    console.log(`Hello on port ${PORT}`);
});

export { server };
