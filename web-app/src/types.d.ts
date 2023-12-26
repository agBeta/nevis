import { Request, Response, CookieOptions, Express, Router, NextFunction } from "express";
import { Pool, Connection } from "mysql2/promise";
import { Server } from "http";
import { RedisClientType, RedisFunctions, RedisScripts, RedisModules } from "redis";

export type ExpressRequest = Request;
export type ExpressResponse = Response;
export type ExpressNextFunc = NextFunction;
export type ExpressApp = Express;
export type ExpressRouter = Router;

export type MYSQLConnection = Promise<Connection>;
export type MySQLConnectionPool = Pool;

export type RedisClient = RedisClientType & RedisFunctions & RedisScripts & RedisModules;

export type WebAppServer = Server;

export type HttpRequest = {
    readonly path: string,
    readonly method: string,
    pathParams: { [key: string]: unknown },
    queryParams:  { [key: string]: unknown },
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
    headers: { 
        "Content-Type": string,
        "Cache-Control": string,
        [key: string]: string
    },
    cookies?: SetCookie[],
};


// Based on https://stackoverflow.com/questions/41705559/dynamically-resolve-property-type-based-on-another-property-value-in-typescript.
interface ResultOfValid { isValid: boolean = true };
interface ResultOfInvalid { isValid: boolean = false, httpErrorResponse: HttpResponse };
export type ValidationResult = ResultOfValid | ResultOfInvalid;


// For reusable function interface, see https://stackoverflow.com/questions/55086068/jsdoc-for-reused-function-interface.


//  No need to specify return type as "HttpResponse | Promise<HttpResponse>". See the following link:
//  https://stackoverflow.com/questions/57695992/in-typescript-why-cant-an-async-function-return-a-union-of-type-t-promiset
export type Controller = {
    // to enforce validation for any controller
    validateRequest: (httpRequest: HttpRequest) => ValidationResult,
    handleRequest: (httpRequest: HttpRequest) => HttpResponse | Promise<HttpResponse>
} | {
    validateRequest: (httpRequest: AuthenticatedHttpRequest) => ValidationResult,
    handleRequest: (httpRequest: AuthenticatedHttpRequest) => HttpResponse | Promise<HttpResponse>
}


// It is safer to use number for timestamp instead of date. The server running this code might have different timezone
// from db server. Also we may use raw sql queries. It prevents ambiguity throughout the code.
export type Timestamp = number;

// Synonyms for services: utility, facility. Not to confuse with so-called 'services' in REST API design.

export type Session = { 
    hashedSessionId: string, 
    userId: string, 
    expiresAt: number,
};

export type Code = {
    hashedCode: string,
    email: string,
    purpose: "signup" | "reset-pass",
    expiresAt: number
};

export type Blog = {
    id: string,
    authorId: string,
    blogTitle: string,
    blogBody: string,
    blogTopic: string,
    imageUrl: string,
    // Note, it isn't number (i.e. timestamp) but native js date object.
    createdAt: Date,
    modifiedAs: Date,
};
export type BlogV2 = {
    id: string,
    authorId: string,
    authorDisplayName: string,
    blogTitle: string,
    createdAt: Date,
    orderId: number,
};

// --------------------- Data access -------------------------------

export type PageDirection = "newer" | "older";

export type PaginateArgument = {
    cursor: number | "newest" | "oldest",
    limit: number,
    direction: PageDirection
};

export type PaginatedResult = {
    headCursor: number | string,
    tailCursor: number | string,
    content: Object[],
};


export type Find_Session_Record_By_HashedSessionId = ({ hashedSessionId: string }) => Promise<Session | null>;

export type Insert_Code = ({ email, hashedCode, purpose, expiresAt }: 
        { email: string, hashedCode: string, purpose: string, expiresAt: number }
    ) => Promise<void>;

// ---------------------
export type EmailDetail = { email: string , subject: string , body : string };
export type SendEmail = (emailDetail: EmailDetail) => Promise<void>;