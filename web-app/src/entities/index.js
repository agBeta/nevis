import { init, isCuid } from "@paralleldrive/cuid2";
import buildMakeUser from "./user.js";

/** @type Id */
const Id = Object.freeze({
    createId: init({
        length: 24,
        // less collision between different hosts  https://github.com/paralleldrive/cuid2#configuration.
        fingerprint: (process.env.APP_ID || "host"),
    }),
    isValidId: isCuid
});

const makeUser = buildMakeUser({ Id: Id, hash });

