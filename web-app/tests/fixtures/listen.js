/**
 * @param {import("#types").WebAppServer} server
 * @param {number} port
 * @returns {Promise<any>}
 * @see https://github.com/nodejs/node/issues/21482#issuecomment-626025579.
 */
export default function doListen(server, port) {
    return new Promise((resolve, reject) => {
        server.listen(port)
            .once("listening", () => {
                console.log(`📞 A (test) server is now ready to accept incoming requests on port ${port}.`);
                return resolve({});
            })
            .once("error", reject);
    });
}
