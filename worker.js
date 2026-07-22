import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import sendEmail from './lib/sendEmail.js';
import emailQueue from './queue.js';

const connection = new Redis("redis://localhost:6379", {
    maxRetriesPerRequest: null, // Disable max retries per request
});


const worker = new Worker(emailQueue, async (job) => {
  console.log(`Processing job: ${job.data.id}`);
    // Simulate some work
    await sendEmail(job.data.email); // Call the sendEmail function to simulate sending an email after a new user is created. The job data includes the user's ID and email address.
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Job completed: ${job.data.id}`);
        resolve();
      }, 1000);
    },{connection: connection});
});



export default worker;

// We need to start the worker process in a separate terminal window to listen for jobs in the emailQueue and process them asynchronously. The worker will log messages to the console indicating when a job is being processed and when it has been completed.
// Worker is basically a server which performs the task of processing jobs in the queue. It listens for new jobs in the queue and executes the associated job processor function when a job is available. In this case, the worker is responsible for processing jobs in the emailQueue and simulating sending an email after a new user is created.
