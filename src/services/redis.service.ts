import redisClient from "../config/redis.js";

export const setRedisValue = async (
  key: string,
  value: string,
  expirationInSeconds?: number,
): Promise<void> => {
  if (expirationInSeconds) {
    await redisClient.set(key, value, {
      EX: expirationInSeconds,
    });
    return;
  }

  await redisClient.set(key, value);
};

export const getRedisValue = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

export const deleteRedisValue = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

export const deleteShipmentCache = async (): Promise<void> => {
  const keys = await redisClient.keys("shipments:*");

  if (keys.length === 0) {
    return;
  }

  await redisClient.del(keys);
};

export const incrementRateLimit = async (
  key: string,
  expirationInSeconds: number,
): Promise<number> => {
  const currentCount = await redisClient.incr(key);

  if (currentCount === 1) {
    await redisClient.expire(key, expirationInSeconds);
  }

  return currentCount;
};
