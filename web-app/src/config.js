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

//  We export some other variables that aren't present among environment variables
//  but are deduced from the environment.

//  We cannot set '__Host-..' cookies on localhost. For integration tests it is fine, since
//  there's no browser to prevent us.
export const NAME_OF_SESSION_COOKIE = process.env.NODE_ENV === "e2e"
    ? "nevis_session_id" : "__Host-nevis_session_id";
