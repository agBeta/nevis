import { Request, Response, CookieOptions } from "express";

export type ExpressRequest = Request;
export type ExpressResponse = Response;

export type HttpRequest = {
    readonly path: string,
    readonly method: string,
    readonly pathParams: { [key: string]: string },
    readonly queryParams:  { [key: string]: unknown },
    /* How you should read it: unknown is I don't know; any is I don't care. */
    readonly body: unknown,
    readonly cookies: { [key: string]: string },
    readonly headers: { [key: string]: string | undefined },
    readonly ip: string | undefined,
    readonly originalUrl: string
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
    body: any,
    headers: { [key: string]: string },
    cookies?: SetCookie[],
};


export type HttpCacheableResponse = HttpResponse & {
    headers: {
        "Last-Modified": string,
        [key: string]: string
    }
};

// For reusable function interface, see https://stackoverflow.com/questions/55086068/jsdoc-for-reused-function-interface.

//  No need to specify return type as "HttpResponse | Promise<HttpResponse>". See the following link:
//  https://stackoverflow.com/questions/57695992/in-typescript-why-cant-an-async-function-return-a-union-of-type-t-promiset
export type Handler = (HttpRequest) => Promise<HttpResponse>;

export type Controller = (HttpRequest) => HttpResponse | Promise<HttpResponse>;


export type VerificationService = {
    createAndSendCode: (email: string) => Promise<void>,
    verify: (email: string, code: string) => Promise<boolean>
};

export type EmailService = {
    send: ({ email: string, subject: string, body: string }) => Promise<void>
}

export type CodeDataAccess = {
    findOne: (criteria: Object) => Promise<any>,
    insert: (Object) => Promise<any>,
    deleteOne: (criteria: Object) => Promise<any>
};