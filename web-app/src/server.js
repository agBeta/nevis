import express from "express";
import dotenv from "dotenv";
import { router as apiRouter } from "./routes/api/index.js";
import { router as filesRouter } from "./routes/files-router.js";

dotenv.config();

const app = express();
app.set("trust proxy", true);

app.use("/api", apiRouter);
app.use("/", filesRouter);

const PORT = process.env.PORT || 7198;

app.listen(PORT, () => {
    console.log(`Hello. We are live on port ${PORT}`);
});
