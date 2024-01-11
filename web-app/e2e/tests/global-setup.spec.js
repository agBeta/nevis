import { clearAll, seedUsers, seedBlogs, dbConnectionPool } from "../utils/seed.js";

console.log("📢 ----- Setup ------");
await clearAll();
console.log("Seeding users");
const userIds = await seedUsers(5, /*saveAsFixtureFile=*/true);
console.log("Seeding blogs");
await seedBlogs(userIds, 50);

// console.log("Seeding Sessions");
// await seedSession(userIds[2], true);

await dbConnectionPool.end();
console.log("gracefully closed dbConnection");
