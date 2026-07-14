import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db.js";
import User from "./model/user.model.js";
import Redis from "ioredis";
import rateLimiter from "./middleware/rate-limit.js";  
import sendEmail from "./lib/sendEmail.js";

dotenv.config();

const app = express();
app.use(express.json());
export const redis = new Redis(process.env.REDIS);
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
    res.json({ message: "This is Coming from the Backend" });
});

app.post("/create-users", async (req, res) => {
    try {
        const { name, email } = req.body;
        await redis.del("user_data:all");                                // Clear the cached data in Redis when a new user is created with the key "user_data:all"
        const user = await User.create({ name, email });
        await sendEmail();  // Call the `sendEmail()` function to simulate sending an email after a new user is created. This function will log a message to the console after a delay of 2 seconds, indicating that the email has been sent successfully.
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/get-data", rateLimiter, async (req, res) => {  // we set middleware in between api and the route to limit the number of requests from a single IP address. The rateLimiter middleware will check if the IP address has exceeded the allowed number of requests and respond with a 429 status code if it has. If the request is allowed, it will proceed to retrieve data from the database and send it in the response.
    // Here you can add logic to retrieve data from the database
    const user =  await User.find({}); // Retrieve the first user from the database
    res.json({ message: "Data retrieved", data: user });
});

app.get("/get-data-redis", async (req, res) => {
    const cachedData = await redis.get("user_data:all");                 // Retrieve the cached data from Redis using the key "user_data:all"
    try {
        if (cachedData) {
            return res.json({ message: "Data retrieved from Redis", data: JSON.parse(cachedData) });
        }
        const user = await User.find({});                               // Retrieve the first user from the database
        await redis.set("user_data:all", JSON.stringify(user), "EX", 3600); // To set the data in Redis and we have to use STring to store data in redis.Cache the data in Redis for 1 hour
        res.json({ message: "Data retrieved from database", data: JSON.parse(user) }); // Used JSON.parse to convert the string back to an object before sending it in the response
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();  // Generate a random 6-digit OTP and store it in the variable `otp` and convert it to a string using `toString()`
    await redis.set(`otp:${email}`, otp, "EX", 30); // Store OTP in Redis for 5 minutes and verify it later when the user submits the OTP for verification. The key is constructed using the email address to ensure uniquenessand we set with the help of key "otp:${email}".
    res.json({ message: "OTP sent", otp });   // Send the generated OTP in the response for testing purposes. In a real application, you would send the OTP via email or SMS instead of returning it in the response.
});
app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = await redis.get(`otp:${email}`); // Retrieve the stored OTP from Redis using the key "otp:${email}"
    if (storedOtp === otp) {
        await redis.del(`otp:${email}`); // Delete the OTP from Redis after successful verification
        res.json({ message: "OTP verified successfully" });
    } else {
        res.status(400).json({ error: "OTP has expired or Invalid OTP" });
    }
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
};

startServer();

export default app;

// Without redis it is taking 228ms
// after adding redis it is taking 9ms to get the data from redis. So we can say that redis is very fast and it is used to cache the data.