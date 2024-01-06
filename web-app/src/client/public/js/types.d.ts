// Based on https://stackoverflow.com/a/12709880
declare global {
    interface Window {  
        SMI: StateManagementInterface,
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