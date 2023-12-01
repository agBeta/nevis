import path from "node:path";
import express from "express";
import dotenv from "dotenv";
import { router as apiRouter } from "./routes/api/index.js";
import { router as filesRouter } from "./routes/files-router.js";
import { createServer } from "node:http";

dotenv.config();
const __dirname = new URL(".", import.meta.url).pathname;

const app = express();
app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "client"));

// app.use("/api", apiRouter);
// app.use("/", filesRouter);
app.get("/*", (req, res) => {
    res.status(200).json({firstName: "Jack"});
});

const PORT = process.env.PORT || 9009;
const server = createServer(app);

if (process.env.NODE_ENV !== "test") {
    server.listen(PORT, () => {
        console.log(`Hello on port ${PORT}`);
    });
}

export { server };
