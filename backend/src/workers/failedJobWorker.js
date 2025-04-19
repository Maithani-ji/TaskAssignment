import { logger } from "../config/logger.js";
import { failedJobQueue } from "../queues/failedJobQueue.js";
import { sendVerificationEmail } from "../service/emailService.js";

failedJobQueue.process(async (job,done)=>{
    
   try {
    logger.info("Email sending from dlq queue")

        // Simulating a failure for retry testing
        // throw new Error("Simulated failure");

    await sendVerificationEmail(job.data)
     done()
   } catch (error) {
    logger.error(`Job dlq failed after ${job.attemptsMade} attempts`);
    logger.error("Failed job processing failed in dlq too",error)
    done(error)
   }
})