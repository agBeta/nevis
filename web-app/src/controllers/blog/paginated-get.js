import Joi from "joi";
import makeHttpError from "../http-error.js";
import makeBasicValidateNormalize from "../validate-normalize.js";

/**
 * @param {{ find_blog_records_paginated: import("#types").Find_Blog_Records_Paginated }} param0
 * @returns {Controller}
 */
export function makeEndpointController({ find_blog_records_paginated }) {

    return Object.freeze({
        handleRequest,

        validateRequest: makeBasicValidateNormalize({
            schemaOfQueryParams: Joi.object({
                cursor: [
                    Joi.string().valid("newest", "oldest"),
                    Joi.number().integer().min(1).max(2147483647/*MySQL max INT*/).required()
                ],
                limit: Joi.number().integer().min(10).max(50).required(),
                direction: Joi.valid("newer", "older").required(),
            }),
        }),
    });

    /** @returns {Promise<HttpResponse>}*/
    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {
        // @ts-ignore
        const /**@type {number|"newest"|"oldest"}*/ cursor = httpRequest.queryParams.cursor;
        // @ts-ignore
        const /**@type {number}*/ limit = httpRequest.queryParams.limit;
        // @ts-ignore
        const /**@type {"newer"|"older"}  */ direction = httpRequest.queryParams.direction;

        const records = await find_blog_records_paginated(
            { cursor, limit: limit + 3 * limit, direction }
        );
        const cnt = records.length;

        if (cnt === 0) {
            return makeHttpError({
                statusCode: 404,
                error: "Not found."
            });
        }

        //  Maybe it would be better to decrypt/encrypt tail and head cursors, and drop orderId from content to
        //  prevent leaking business info. But let's not do that.

        //  Client should interpret head and tail cursors based on direction. If direction="older", then tailCursor
        //  is older (or smaller in terms of "orderId") than headCursor. If direction="newer" it is opposite.

        const /**@type {PaginatedResult}*/ currentPage = cnt >= limit
            ? {
                content: records.slice(0, limit),
                headCursor: records[0].orderId,
                tailCursor: records[limit - 1].orderId,
            }
            : {
                content: records.slice(0, cnt),
                headCursor: records[0].orderId,
                tailCursor: records[cnt - 1].orderId,
            };

        const /**@type {PaginatedResult[] | null}*/ threePagesBeyondInSameDirection = cnt <= limit ? null :
            Array(/*size=*/Math.ceil((cnt - limit) / limit)).fill(null).map((_, index) => {
                return {
                    // first limit+ is because of currentPage.
                    content: records.slice(limit + index * limit, limit + (index + 1) * limit),
                    headCursor: records[limit + index * limit].orderId,
                    tailCursor: records[Math.min(limit + (index + 1) * limit - 1, cnt - 1)].orderId,
                };
            });


        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                //  We could have set larger max-age for pages other than first one (i.e. most recently published).
                //  But let's keep it simple.
                "Cache-Control": "public, max-age=60",
            },
            payload: JSON.stringify({
                current: currentPage,
                beyond: threePagesBeyondInSameDirection
            }),
        };
    }
}



/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 * @typedef {import("#types").PaginatedResult} PaginatedResult
 */
