// Based on https://stackoverflow.com/a/12709880
declare global {
    interface Window {  
        SMI: StateManagementInterface,
        Router: {
            navigateTo: (routeToNavigate: string, addToHistory: boolean = true) => void,
            init: () => void,
        },
        MAX_ANIMATION_TIME: number
    }
}
type StateManagementInterface = {
    setSate: (key: string, value: object) => boolean,
    getState: (key:string) => object | null,
    clearStates: () => void,
    setCurrentViewOnScreen: (nameOfView: string, timestamp: number) => void,
    getCurrentViewOnScreen: () => { name: string, timestamp: number },
};

export type Route = {
    path: string,
    pageView: PageView,
    guard?: (args?: any) => ({
        canPrecede: boolean,
        redirectPathIfFailed: string,
    })
}

export type PageView = {
    render: (params) => Promise<void>,
    NAME: string,
}

export type FetchBlogPaginated =
    ({ direction, cursor, limit }: { direction: "newer"|"older", cursor: string, limit: string | number })
    => Promise<{
        statusCode: number, 
        body: any,
    }>;

export type FetchBlog = ({ blogId } : { blogId: string }) 
    => Promise<{
        statusCode: number, 
        body: any,
    }>;

export type PostEmailForCode = 
    ({ email, purpose }: { email: string, purpose: "signup" | "reset-password" })
    => Promise<{
        statusCode: number,
        body: any,
    }>;

export type PostSignup =
    ({ email, displayName, password, repeatPassword, birthYear, code }:
        { email: string, displayName: string, password: string, repeatPassword: string, birthYear: integer, code: string }
    )
    => Promise<{
        statusCode: number,
        body: any,
    }>;

export type PostLogin = 
    ({ email, password, rememberMe }: { email: string, password: string, rememberMe: boolean })
    => Promise<{
        statusCode: number,
        body: any,
    }>;

export type PostLogout =
    () => Promise<{ statusCode: number, body: any }>;


export type PostBlog = 
    ({ blogTitle, blogBody, blogTopic, imageUrl, actionId }:
      { blogTitle: string, blogBody: string, blogTopic: string, imageUrl: string, actionId: string}) 
    => Promise<{
        statusCode: number,
        blogId: string | null,
    }>;

export type RequestNewAction = (purpose: "add-blog") 
    => Promise<{
        statusCode: number,
        actionId: string | null,
    }>;

// -------------------------------------

export type SignupState = null | {
    step: "code" | "signup" | "loading" | "error_code" | "error_signup" | "completed",
    enteredEmail?: string,
    enteredDisplayName?: string,
    enteredPassword?: string,
    enteredRepeatPassword?: string,
    enteredBirthYear?: string,
    enteredCode?: string,
    error?: string,
};

export type LoginState = null | {
    state: "login" | "loading" | "error_login" ,
    error?: string,
};

export type AddBlogState = null | {
    state: "add" | "loading" | "error",
    error?: string,
    enteredBlogTitle?: string,
    enteredBlogBody?: string,
    enteredBlogTopic?: string,
    enteredImageUrl?: string,
    lastActionId?: string,
};