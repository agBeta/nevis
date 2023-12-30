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
    queryParams: { [key: string]: unknown },
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
    validateRequest: (httpRequest: HttpRequest | AuthenticatedHttpRequest) => ValidationResult,
    handleRequest: (httpRequest: HttpRequest | AuthenticatedHttpRequest) => HttpResponse | Promise<HttpResponse>
};


// Synonyms for services: utility, facility. Not to confuse with so-called 'services' in REST API design.

// ------------------------------------------------------------

//? ⏰ Why all date-time related fields are number? It prevents lots of headaches and inconsistencies. See:
//     - Unknown aspects of scaling in REST.md in self-documentation.
//     - date-and-time.md in self-documentation.

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

export type Action = {
    id: string,
    userId: string,
    purpose: string,
    state: number,
    response: string | null,
    expiresAt: number,
};

export type Blog = {
    id: string,
    authorId: string,
    blogTitle: string,
    blogBody: string,
    blogTopic: string,
    imageUrl: string,
    // Note, it isn't number (i.e. timestamp) but native js date object.
    createdAt: number,
    modifiedAt: number,
};
export type BlogV2 = {
    id: string,
    authorId: string,
    authorDisplayName: string,
    blogTitle: string,
    createdAt: number,
    orderId: number,
};

export type User = {
    id: string,
    email: string,
    displayName: string,
    birthYear: number,
    signupAt: number,
    hashedPassword?: string,
};

export type PaginatedResult = {
    headCursor: number | string,
    tailCursor: number | string,
    content: Object[],
};

// --------------------- Data access -------------------------------
export type PageDirection = "newer" | "older";
export type PaginateArgument = {
    cursor: number | "newest" | "oldest",
    limit: number,
    direction: PageDirection
};

export type Find_Blog_Records_Paginated = (paginateArg: PaginateArgument) => Promise<BlogV2[]>;

export type Find_Session_Record_By_HashedSessionId = ({ hashedSessionId }: { hashedSessionId: string })
    => Promise<Session | null>;

export type Find_User_Records_By_Email = ({ email }: { email: string }, omitPassword: boolean = true)
    => Promise<User[]>

export type Find_Action_Record_By_ActionId = ({ actionId }: { actionId: string }) => Promise<Action | null>;

export type Find_Blog_Record_By_BlogId = ({ blogId }: { blogId: string }) => Promise<Blog | null>;

export type Find_Code_Records_By_Email = ({ email }: { email: string }) => Promise<Code[]>;

export type Insert_Code = ({ email, hashedCode, purpose, expiresAt }:
    { email: string, hashedCode: string, purpose: string, expiresAt: number }
) => Promise<void>;


export type Insert_Session = ({ hashedSessionId, userId, expiresAt }:
    { hashedSessionId: string, userId: string, expiresAt: number }
) => Promise<void>;

export type Insert_User = ({ id, email, hashedPassword, displayName, birthYear, signupAt }:
    {
        id: string, email: string, hashedPassword: string, displayName: string, birthYear: number,
        signupAt: number
    }
) => Promise<void>;

// ---------------------

export type EmailService = {
    sendEmail: ({ email, subject, body }: { email: string, subject: string, body: string }) => Promise<void>,
};
