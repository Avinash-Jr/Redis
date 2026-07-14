import Redis from "ioredis";
const redis = new Redis(process.env.REDIS);
const rateLimiter =  async (req, res, next) => {
   const ip = req.ip;  // Get the IP address of the incoming request using `req.ip`. This will be used to create a unique key in Redis for each IP address to track the number of requests made by that IP address.
   const key = `rate-limit:${ip}`;  // Create a unique key for each IP address to track the number of requests made by that IP address. The key is constructed using the prefix "rate-limit:" followed by the IP address, which ensures that each IP address has its own unique key in Redis.
   const request = await redis.get(key); // Check if the key exists in Redis. If it does, it means that the user has made a request within the last minute, and we need to check if they have exceeded the limit of 5 requests per minute. If the key does not exist, it means that this is the user's first request within the last minute, and we can allow them to proceed with their request.
   if (request) {
       const requestCount = parseInt(request); // Convert the request count to an integer using `parseInt()` so that we can compare it with the limit of 5 requests per minute. This is necessary because Redis stores values as strings, and we need to perform a numerical comparison to determine if the request count has exceeded the limit.
       if (requestCount >= 5) {
           return res.status(429).json({ error: "Too many requests. Please try again later." });  // If the request count exceeds the limit of 5 requests per minute, respond with a 429 status code and an error message indicating that the user has made too many requests and should try again later.
       }
       await redis.incr(key);  // Increment the request count for the user's IP address in Redis using `redis.incr()`. This will increase the value of the key by 1, indicating that the user has made another request within the last minute. If the key does not exist, Redis will create it and set its value to 1.
   } else {
       await redis.set(key, 1, "EX", 60);  // If the key does not exist, set the key in Redis with an initial value of 1 and an expiration time of 60 seconds using `redis.set()`. This will create a new key for the user's IP address and set its value to 1, indicating that the user has made their first request within the last minute. The expiration time ensures that the key will be automatically deleted after 60 seconds, allowing the user to make new requests after that time period has passed.
   } 
   next();  // Call the `next()` function to pass control to the next middleware function in the stack. This allows the request to proceed to the next middleware or route handler after the rate limiting check has been performed. If the user has exceeded the limit of 5 requests per minute, the request will not proceed to the next middleware or route handler, and an error response will be sent instead.

}

export default rateLimiter;