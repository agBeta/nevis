import dotenv from "dotenv";
import path from "node:path";

if (process.env.NODE_ENV === "e2e") {
    dotenv.config({
        path: path.resolve(new URL(".", import.meta.url).pathname, "..", "e2e", "e2e.env"),
        override: true
    });
} else {
    dotenv.config();
}
