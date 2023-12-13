import path from "path";
import * as winston from "winston";
import "winston-daily-rotate-file";


const __dirname = new URL(".", import.meta.url).pathname;
const APP_ID = process.env.APP_ID || "host";

const transport1 = new winston.transports.DailyRotateFile({
    level: "http",
    filename: "app-" + APP_ID + "-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "25m",
    maxFiles: "7d",
    dirname: path.resolve(__dirname, "..", "..", "logs"),
});
transport1.on("rotate", function (oldFilename, newFilename) {
    /* do something fun */
});


const logger = winston.createLogger({
    transports: [transport1],
    // See https://github.com/winstonjs/winston#formats.
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(csvLogTemplate),
    )
});

if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
    // In development and test mode, we also log into console.
    logger.add(
        new winston.transports.Console({
            level: "http",
            format: winston.format.combine(
                // According to https://github.com/winstonjs/logform#colorize.
                winston.format.colorize({
                    colors: { warn: "yellow", error: "red", http: "white", info: "blue" },
                }),
                winston.format.timestamp(),
                winston.format.printf(csvLogTemplate),
            ),
        }),
    );
}

/**
 * @param {{
 *      level: "http" | "info" | "error" | "warn",
 *      keyword: string,
 *      message: string
 * }} tInfo
 */
export default function log({ level, keyword, message }) {
    const s = getCsvFriendly(keyword, message);
    // Trying not to ruin csv formatting. See also:
    // https://stackoverflow.com/questions/4617935/is-there-a-way-to-include-commas-in-csv-columns-without-breaking-the-formatting
    logger.log(level, s);
}


/**
 * Removes commas(,) and double-quotations(") from keyword and message and concatenates the two
 * @param {string} keyword
 * @param {string} message
 */
export function getCsvFriendly(keyword, message) {
    return "\"" + keyword.replace(/"/g, "|").replace(/,/g, " ") + "\"" + ", "
        + "\"" + message.replace(/"/g, "|").replace(/,/g, " ") + "\"";
}


/**
 * @param {TransformableInfo} tInfo
 * @returns {string} formatted log
 * @see https://github.com/winstonjs/logform.
 */
function csvLogTemplate(tInfo) {
    const levelString = tInfo.level.padEnd(7);

    //  We didn't use toLocaleString() since the date part is already included in the log filename.
    //  We only need the time. Something like 13:47:56.
    const timestampString = new Date(tInfo.timestamp).toLocaleTimeString("en", { hour12: false }).padStart(8, "0");

    return `${timestampString}, ${levelString}, ${tInfo.message}`;
}


/**
 * @typedef {import("logform").TransformableInfo} TransformableInfo
 */
