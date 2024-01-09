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
export function getSomeRealUsers(n = 1){
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

// maybe functions like find_user, etc, to interact with db
//
