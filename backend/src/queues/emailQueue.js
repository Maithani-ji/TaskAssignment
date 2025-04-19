import dotenv from "dotenv";
import Queue from "bull";
dotenv.config()
export const emailQueue= new Queue("emailQueue",process.env.REDIS_URL)