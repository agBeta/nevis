import { Request, Response, CookieOptions } from "express";
import { Pool, Connection } from "mysql2/promise";
import { Server } from "http";

export type ExpressRequest = Request;
export type ExpressResponse = Response;

export type MYSQLConnection = Promise<Connection>;
export type MySQLConnectionPool = Pool;

export type WebAppServer = Server;

export type HttpRequest = {
    readonly path: string,
    readonly method: string,
    readonly pathParams: { [key: string]: string },
    readonly queryParams:  { [key: string]: unknown },
    /* How you should read it: unknown is I don't know; any is I don't care. */
    readonly cookies: { [key: string]: string },
    readonly headers: { [key: string]: string | undefined },
    readonly ip: string | undefined,
    readonly originalUrl: string,
    body: Object,
};

export type AuthenticatedHttpRequest = HttpRequest & {
    // userId is set by retrieving session from the database
    readonly userId: number
};


export type SetCookie = {
    readonly name: string,
    readonly value: string,
    // See https://stackoverflow.com/questions/69327990/how-can-i-make-one-property-non-optional-in-a-typescript-type.
    readonly options: CookieOptions & {
        maxAge: number,
        httpOnly: boolean,
        secure: boolean
    }
};

export type HttpResponse = {
    statusCode: number,
    payload: any,
    headers: { [key: string]: string },
    cookies?: SetCookie[],
};


export type HttpCacheableResponse = HttpResponse & {
    headers: {
        "Last-Modified": string,
        [key: string]: string
    }
};


// Based on https://stackoverflow.com/questions/41705559/dynamically-resolve-property-type-based-on-another-property-value-in-typescript.
interface ResultOfValid { isValid: true };
interface ResultOfInvalid { isValid: false, httpErrorResponse: HttpResponse };
export type ValidationResult = ResultOfValid | ResultOfInvalid;
// The following didn't work as expected and ts annoys in express-callback.
// { isValid: boolean = true } | { isValid: boolean = false, httpErrorResponse: HttpResponse };


// For reusable function interface, see https://stackoverflow.com/questions/55086068/jsdoc-for-reused-function-interface.


//  No need to specify return type as "HttpResponse | Promise<HttpResponse>". See the following link:
//  https://stackoverflow.com/questions/57695992/in-typescript-why-cant-an-async-function-return-a-union-of-type-t-promiset
export type Controller = {
    // to enforce validation for any controller
    validateRequest: (httpRequest: HttpRequest) => ValidationResult,
    handleRequest: (httpRequest: HttpRequest) => HttpResponse | Promise<HttpResponse>
}


// It is safer to use number for timestamp instead of date. The server running this code might have different timezone
// from db server. Also we may use raw sql queries. It prevents ambiguity throughout the code.
export type Timestamp = number;

// Synonyms for services: utility, facility. Not to confuse with so-called 'services' in REST API design.

export type IdFacility = {
    createId: () => string,
    isValidId: (string) => boolean
};

export type UserRawInformation = {
    id?: string,
    email: string,
    displayName: string,
    birthYear: number,
    signupAt?: Timestamp,
    lastLoginAt?: Timestamp
}
export type User = {
    getId: () => string,
    getEmail: () => string,
    getDisplayName: () => string,
    getBirthYear: () => number,
    getSignupAt: () => Timestamp,
    getLastLoginAt: () => Timestamp
};

export type UserFactory = (UserRawInformation) => User;


export type PostRawInformation = {
    id?: string,
    authorId: string,
    postTitle: string,
    postBody: string,
    isPublished?: boolean,
    createdAt?: Timestamp,
    modifiedAt?: Timestamp
};
export type Post = {
    getId: () => string,
    getAuthorId: () => string | "deleted",
    getPostTitle: () => string,
    getPostBody: () => string,
    isDeleted: () => boolean,
    markDeleted: () => void,
    getCreatedAt: () => Timestamp,
    getModifiedAt: () => Timestamp,
    isPublished: () => boolean,
    publish: () => void,
    unPublish: () => void
}

export type PostFactory = (PostRawInformation) => Post;

// ---------------------- Services ---------------------------------

export type CodeService = {
    generateCode: () => Promise<string>,
    storeInDbAndSendCode: (string, string) => Promise<void>,
    verifyCode: (string, string) => Promise<boolean>
};


