import { Queue } from 'bullmq';
import Redis from 'ioredis';


const connection = new Redis("redis://localhost:6379", {
    maxRetriesPerRequest: null, // Disable max retries per request
});
const emailQueue = new Queue('emailQueue', {connection});  // Name of the worker queue: emailQueue:


export default emailQueue;