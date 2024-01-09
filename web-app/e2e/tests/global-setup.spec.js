import { clearAll, seedUsers, seedBlogs, dbConnectionPool } from "../utils/seed.js";

console.log("📢 ----- Setup ------");
await clearAll();
const userIds = await seedUsers(5, /*saveAsFixtureFile=*/true);
await seedBlogs(userIds, 50);

await dbConnectionPool.end();
console.log("gracefully closed dbConnection");

