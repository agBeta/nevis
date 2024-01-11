import path from "node:path";
import fs from "node:fs";

const pathToUsersFixture = path.resolve(
    new URL(".", import.meta.url).pathname, "..", "fixtures", "users.json"
);

/**
 * @param {number} [n=1]
 * @returns {Array<{
 *      id: string,
 *      email: string,
 *      password: string,
 *      displayName: string,
 *      birthYear: 1364,
 *      signupAt: Date,
 * }>}
 */
export function getSomeRealUsers(n = 1) {
    const allUsersFixtures = JSON.parse(fs.readFileSync(pathToUsersFixture, "utf-8"));
    // @ts-ignore
    const users = allUsersFixtures.slice(0, n).map(user => {
        return {
            ...user,
            signupAt: new Date(user.signupAt), // convert string to native JS Date object
        };
    });
    return users.slice(0, n);
}


export function getSomeAuth() {
    const fixturesFolder = path.resolve(
        new URL(".", import.meta.url).pathname, "..", "fixtures"
    );
    const userIdsThatHaveAuthFixture = fs.readdirSync(fixturesFolder)
        .filter(file => file.includes("auth_"))
        .map(function extractUserIdFromAuthFileName(file) {
            const userId = file.slice("auth_".length, file.length - ".json".length);
            return userId;
        });
    //  BTW, read note about readdir at the end this file.

    return {
        userId: userIdsThatHaveAuthFixture[0],
        pathToAuthFixture: path.resolve(fixturesFolder, "auth_" + userIdsThatHaveAuthFixture[0] + ".json"),
    };
}
/*
    Note: readdir also shows directory names. To filter these, use fs.stat(path, callback(err, stats))
    and stats.isDirectory(). – comment by "Rob W", from https://stackoverflow.com/a/2727191.
*/
