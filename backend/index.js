import http from "http"
import dotenv from "dotenv"
import app from "./app.js"
import { logger } from "./src/config/logger.js"

dotenv.config()

const PORT_URL = process?.env?.PORT || 3001

const server=http.createServer(app)

server.listen(PORT_URL, () => {
    logger.info(`Server running on port ${PORT_URL}`)
})

// Error handling for server
process.on("uncaughtException",(err)=>{
    logger.error(`[UNCAUGHT EXCEPTION] : ${err.message}`,
        {stack:err.stack},
    )
    process.exit(1)
})


// handle unhandled promises

process.on("unhandledRejection",(err)=>{
    logger.error(`[UNHANDLED REJECT]: ${err.message}`,
        {
            stack:err.stack,
        },
    )
})