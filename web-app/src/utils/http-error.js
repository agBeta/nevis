/**
 * @param {{ statusCode: number, errorMessage: string }} Details
 * @returns {import("#types").HttpResponse}
 */
export default function makeHttpError({ statusCode, errorMessage }) {
    return {
        headers: { "Content-Type": "application/json" },
        statusCode,
        body: JSON.stringify({
            success: false,
            error: errorMessage
        })
    };
}
