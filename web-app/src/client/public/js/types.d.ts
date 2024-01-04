export type PageView = {
    render: (params) => Promise<void>
}

export type FetchBlogPaginated =
    ({ direction, cursor, limit }: { direction: "newer"|"older", cursor:string, limit:string | number })
    => Promise<{
        statusCode: number, 
        body: any,
    }>;
