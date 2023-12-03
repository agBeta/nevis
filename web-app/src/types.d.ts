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
export type Controller = (httpRequest: HttpRequest) => HttpResponse | Promise<HttpResponse>;

// Synonyms for services: utility, facility. Not to confuse with so-called 'services' in REST API design.
// ----------------------------
// ----------------------------
export type Timestamp = number;

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

};

export type UserFactory = (UserRawInformation) => User;


//  No need to specify return type as "HttpResponse | Promise<HttpResponse>". See the following link:
//  https://stackoverflow.com/questions/57695992/in-typescript-why-cant-an-async-function-return-a-union-of-type-t-promiset
// export type Handler = (httpRequest: HttpRequest) => Promise<HttpResponse>;

