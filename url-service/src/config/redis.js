const { createClient } = require("redis");

let rawRedisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Strip CLI command prefix if accidentally pasted (e.g., redis-cli --tls -u ...)
if (rawRedisUrl.includes("redis-cli")) {
    const match = rawRedisUrl.match(/(rediss?:\/\/[^\s'"]+)/);
    if (match) {
        rawRedisUrl = match[1];
    }
}

// Upstash requires TLS/SSL (rediss:// instead of redis://)
if (rawRedisUrl.includes("upstash.io") && rawRedisUrl.startsWith("redis://")) {
    rawRedisUrl = rawRedisUrl.replace("redis://", "rediss://");
}

const redisClient = createClient({
    url: rawRedisUrl
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

(async () => {
    try {

        await redisClient.connect();

        console.log("Redis Connected");

    } catch (error) {

        console.error(
            "Redis Connection Error:",
            error
        );

    }
})();

module.exports = redisClient;
