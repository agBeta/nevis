import { InvalidStateError } from "#utils/errors";

const DELETED_TITLE = "xX این پست حذف شده است Xx";
const DELETED_BODY = "xX این پست حذف شده است Xx";

/**
 * @param {{ Id: import("#types").IdFacility, calcHash: (text: string) => string, sanitize: (text: string) => string }} injections
 * @returns {import("#types").PostFactory}
 */
export default function buildMakePost({ Id, calcHash, sanitize }) {
    return makePost;

    /**
     * @param {import("#types").PostRawInformation} info
     * @returns {import("#types").Post}
     */
    function makePost({
        id = Id.createId(),
        authorId,
        postTitle,
        postBody,
        isPublished = false,
        createdAt = Date.now(),
        modifiedAt = Date.now()
    }) {

        if (!Id.isValidId(id)) {
            throw new InvalidStateError("Post must have a valid id.");
        }
        if (!Id.isValidId(authorId)) {
            throw new InvalidStateError("Post must have a valid authorId.");
        }
        if (!postTitle) {
            throw new InvalidStateError("Post must have a postTitle.");
        }
        if (!postBody) {
            throw new InvalidStateError("Post must have a postBody.");
        }

        let sanitizedTitle = sanitize(postTitle).trim();
        let sanitizedBody = sanitize(postBody).trim();

        if (sanitizedTitle.length < 1) {
            throw new InvalidStateError("Post title contains no usable text.");
        }
        if (sanitizedBody.length < 1) {
            throw new InvalidStateError("Post body contains no usable text.");
        }

        //  Hash is an expensive time-consuming function. We calculate the hash only the first time we want to
        //  access it, and store it in the following variable for future calls.
        let /** @type {string} */ hash;

        return Object.freeze({
            getId: () => id,
            getCreatedAt: () => createdAt,
            getModifiedAt: () => modifiedAt,
            getAuthorId: () => authorId,
            getPostTitle: () => sanitizedTitle,
            getPostBody: () => sanitizedBody,
            getHash: () => hash || (hash = calcHash(sanitizedTitle + sanitizedBody + isPublished + authorId)),
            isDeleted: () => sanitizedBody === DELETED_BODY,
            markDeleted: () => {
                sanitizedBody = DELETED_BODY;
                sanitizedTitle = DELETED_TITLE;
                authorId = "deleted";
            },
            isPublished: () => isPublished,
            publish: () => {
                isPublished = true;
            },
            unPublish: () => {
                isPublished = false;
            }
        });
    }
}
