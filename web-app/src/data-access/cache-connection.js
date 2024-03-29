import { createClient } from "redis";
import { AppError, OperationalError } from "#utils/errors.js";

let /**@type {RedisClient}*/ redisClient;

/** @returns {Promise<RedisClient>} */
export default async function makeRedisClient() {
    if (process.env.DISABLE_CACHE) {
        throw new Error("Cache is disabled.");
    }
    if (redisClient) {
        return redisClient;
    }
    const redisHost = process.env.REDIS_HOST;
    const redisPort = process.env.REDIS_PORT;
    const redisPassword = process.env.REDIS_PASSWORD;

    if (!redisHost || !redisPort ||
        (redisPassword == null && process.env.NODE_ENV !== "test" && process.env.NODE_ENV !== "e2e")) {
        throw new AppError("Some of Redis environment variables are missing", "cache__connect");
    }

    try {

        const client = await createClient({
            socket: {
                host: redisHost,
                port: Number(redisPort),
            },
            password: redisPassword,
            name: "nodejs_client_" + (process.env.APP_ID ?? "default"),
        })
            .connect();

        // @ts-ignore
        redisClient = client;
        return redisClient;
    }
    catch (err) {
        throw new OperationalError("Failed to connect to Redis server. " + err.message, "cache__connect");
    }
}

/**
 * @typedef {import("#types").RedisClient} RedisClient
 */
