import http from "http"
import dotenv from "dotenv"
import app from "./app.js"
import { logger } from "./src/config/logger.js"
import { setupGracefulShutdown } from "./src/config/shutdown.js"
import { closeDB, connectDB } from "./src/config/db.js"
import { redisClient, connectRedis } from "./src/config/redis.js"




dotenv.config()

// Error handling for server
process.on("uncaughtException",(err)=>{
    logger.error(`[UNCAUGHT EXCEPTION] : ${err.message}`,
        {stack:err.stack})
    process.exit(1)
})


// handle unhandled promises
process.on("unhandledRejection",(err)=>{
    logger.error(`[UNHANDLED REJECTION]: ${err.message}`,
        {
            stack:err.stack,
        },
    )
})

const PORT_URL = process?.env?.PORT || 3001


// Connect to MongoDB
await connectDB();
await connectRedis()
const server=http.createServer(app)

server.listen(PORT_URL, () => {
    logger.info(`Server running on port ${PORT_URL}`)
})
// A promise that gets rejected without a handler
// new Promise((resolve, reject) => {
//     reject(new Error("This is an unhandled promise rejection!"));
// });
// Hanlde gracefull shutdown
setupGracefulShutdown(server,closeDB)

