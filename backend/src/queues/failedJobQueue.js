import dotenv from "dotenv"
import Queue from "bull"

dotenv.config()
export const failedJobQueue= new Queue("failedJobQueue",process.env.REDIS_URL)