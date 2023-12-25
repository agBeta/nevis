import Joi from "joi";
import makeHttpError from "../http-error.js";
import makeBasicValidateNormalize from "../validate-normalize.js";

/**
 * @param {*} param0
 * @returns {Controller}
 */
export function makeEndpointController({ find_blog_record_by_blogId }) {

    return Object.freeze({
        handleRequest,

        validateRequest: makeBasicValidateNormalize({
            schemaOfPathParams: Joi.object({
                blogId: Joi.string().min(10).max(50).required(),
            }),
        }),
    });

    /** @returns {Promise<HttpResponse>} */
    async function handleRequest(/**@type {HttpRequest}*/ httpRequest) {
        const blogId = /**@type {string}*/(httpRequest.pathParams.blogId);
        const blog = await find_blog_record_by_blogId({ blogId });
        if (!blog) {
            return makeHttpError({
                statusCode: 404,
                error: "Not found."
            });
        }
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                // Since we don't allow editing a blog, it is ok to set cache-control as below
                "Cache-Control": "public, max-age=36000",
            },
            payload: JSON.stringify(blog),
        };
    }
}


/**
 * @typedef {import("#types").HttpRequest} HttpRequest
 * @typedef {import("#types").HttpResponse} HttpResponse
 * @typedef {import("#types").Controller} Controller
 */
