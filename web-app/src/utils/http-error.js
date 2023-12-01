/**
 * @param {{ statusCode: number, error: string }} Details
 * @returns {import("#types").HttpResponse}
 */
export default function makeHttpError({ statusCode, error }) {
    return {
        headers: { "Content-Type": "application/json" },
        statusCode,
        body: JSON.stringify({ success: false, error })
    };
}
