import redis from "../config/redis.js";

export const cacheTasks = async (req, res, next) => {
  const userId = req.user.id;
  const queryString = JSON.stringify(req.query);
  const cacheKey = `tasks:${userId}:${queryString}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("Cache HIT:", cacheKey);
      return res.json(JSON.parse(cached));
    }

    console.log("Cache MISS:", cacheKey);

    // Override res.json to cache the response before sending
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      redis.setex(cacheKey, 60, JSON.stringify(data)); // 60 sec TTL
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.error("Cache error:", err.message);
    next(); // If cache fails, continue without it
  }
};

export const invalidateUserCache = async (userId) => {
  const keys = await redis.keys(`tasks:${userId}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
    console.log(`Invalidated ${keys.length} cache keys for user ${userId}`);
  }
};
