/**
 * Runtime check.
 * Though TS helps us catch such type-related bugs but some consumer might bypass type checks by ts-ignore.
 * Checks also timestamp is in milliseconds.
 * @param {unknown} thing
 * @returns {boolean}
 */
export function isTimestampAndIsInMilliseconds(thing) {
    if (typeof thing !== "number") {
        return false;
    }
    //  Given thing must be in milliseconds (not in seconds). If the consumer incorrectly gives a timestamp
    //  in seconds, then the corresponding date of given timestamp would be something near 1970, way before
    //  2000s.
    if (thing < new Date("1990-01-01T00:00:00+00:00").getTime()) {
        return false;
    }
    return true;
}
