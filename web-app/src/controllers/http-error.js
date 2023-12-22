/**
 * @param {{ statusCode: number, error: string }} Details
 * @returns {import("#types").HttpResponse}
 */
export default function makeHttpError({ statusCode, error }) {
    return {
        headers:{
            "Content-Type": "application/json",
            // Bad practice, but ok for now.
            "Cache-Control": "no-store",
        },
        statusCode,
        payload: JSON.stringify({ success: false, error }),
    };
}


// Bill Souror places files like not-found.js in controllers folder. See https://github.com/dev-mastery/comments-api/tree/master.
