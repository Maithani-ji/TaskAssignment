import { logger } from "../config/logger.js";
import { emailQueue } from "../queues/emailQueue.js";
import { failedJobQueue } from "../queues/failedJobQueue.js";
import { sendVerificationEmail } from "../service/emailService.js";

emailQueue.process(async (job,done)=>{
    
try {
    logger.info("Email sending from email queue")
    
        // Simulating a failure for retry testing
        // throw new Error("Simulated failure");

    await sendVerificationEmail(job.data)
    done()
} catch (error) {
    logger.error(`Email queue Job failed after ${job.attemptsMade} ${job.opts.attempts} attempts`);
   

    done(error);
}

})
// Listen for job failures and push to the DLQ when max retries are exceeded
emailQueue.on("failed", async (job, error) => {
    logger.info(`Job failed after ${job.attemptsMade} ${job.opts.attempts} attempts`, error);
console.log(job.attemptsMade,job.opts.attempts);

    // If max attempts are reached, push job to DLQ
    if (job.attemptsMade >= job.opts.attempts) {
        logger.info("Max retry attempts reached. Pushing job to DLQ", error);

        await failedJobQueue.add(job.data, {
            attempts: 3,
            removeOnComplete: true,
            removeOnFail: false,
            delay: 1000,
            priority: 1,
            backoff: { type: "exponential", delay: 5000 },
        });
    }
});