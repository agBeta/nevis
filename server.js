import path from "path";
import express from "express";

const __dirname = new URL(".", import.meta.url).pathname;

const app = express();

app.set("trust proxy", true);
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "client"));


app.use("/public/fonts",
    //  By default, "express.static()" sets Cache-Control to 'public, max-age=0', so we are fine. But for fonts, we
    //  decided to cache them for a long time.
    express.static(path.resolve(__dirname, "client", "public", "fonts"), { maxAge: "30d" })
);
app.use("/public", express.static(path.resolve(__dirname, "client", "public")));

const PORT = process.env.PORT || 7186;

app.listen(PORT, () => {
    console.log(`Hello. We are live on port ${PORT}`);
});
