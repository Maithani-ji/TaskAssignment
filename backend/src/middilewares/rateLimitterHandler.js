// Import the logger for logging info/warnings, and Redis client for storing rate-limiting data
import { logger } from "../config/logger.js"
import { redisClient } from "../config/redis.js"

// Create a token bucket rate limiter middleware
export const tokenBucketLimiter = (keyPrefix, {
    bucketCapacity = 10,   // Maximum number of tokens in the bucket (burst limit)
    refillRate = 1,        // Tokens replenished per second
  }) => {
    logger.info("Token bucket limiter started"); // Log once when the middleware is created
  
    // Return an actual Express middleware function
    return async (req, res, next) => {
      try {
        // Construct a unique Redis key using the prefix and request IP
        const key = `${keyPrefix}:${req.ip}`;
        const now = Date.now(); // Current timestamp in milliseconds
  
        // Retrieve existing token data from Redis (returns an object)
        const data = await redisClient.hGetAll(key);
        
        // Initialize token count and last refill time
        let tokens, lastRefill;

        // If no data in Redis, it's the first request — start with full bucket
        if (!data.tokens || !data.lastRefill) {
          tokens = bucketCapacity;
          lastRefill = now;
        } else {
          tokens = parseFloat(data.tokens);         // Get the saved token count
          lastRefill = parseInt(data.lastRefill);   // Get last refill timestamp
        }

        // Calculate how much time has passed since last refill (in seconds)
        const timeSinceLastRefill = (now - lastRefill) / 1000;

        // Calculate how many tokens should be refilled in that time
        const tokenToRefill = timeSinceLastRefill * refillRate;

        // Add new tokens but don’t exceed the bucket’s capacity
        tokens = Math.min(tokens + tokenToRefill, bucketCapacity);

        // Update the refill timestamp to current time
        lastRefill = now;

        // Log the number of tokens left for this IP
        logger.info(`Tokens remaining: ${tokens.toFixed(3)} for ${req.ip}`);

        // If there's at least 1 token, allow the request and consume one token
        if (tokens >= 1) {
          tokens -= 1;

          // Save the updated token count and timestamp back to Redis
          await redisClient.hSet(key, {
            tokens: tokens.toFixed(3),  // Save with 3 decimal precision
            lastRefill,                 // Save updated timestamp
          });

          next(); // Pass control to the next middleware or route handler
        } else {
          // If no tokens left, deny the request with 429 Too Many Requests
          logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
          res.status(429).json({ error: "Rate limit exceeded" });
        }
      } catch (error) {
        // Pass any unexpected errors to the error handler middleware
        next(error);
      }
    };
  };
