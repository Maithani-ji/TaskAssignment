
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { requestLogger } from "./src/middilewares/requestLogger.js";
import { logger } from "./src/config/logger.js";
// Api  Routes 
import authRoute from "./src/routes/authRoutes.js" 
import taskRoute from "./src/routes/taskRoutes.js";
import userRoute from "./src/routes/userRoutes.js";
// Error middlewares
import { errorHandler, notFoundHandler } from "./src/middilewares/errorHandler.js";
import { successHandler } from "./src/middilewares/succesHandler.js";
import { tokenBucketLimiter } from "./src/middilewares/rateLimitterHandler.js";


// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
dotenv.config(); 

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));  // Optional: for form data

// Use cookie-parser middleware
app.use(cookieParser());

app.use(cors())
//  CORS EXTRAS...

// const corsOptions = {
//     origin: "http://example.com",  // Allow only requests from this origin
//     methods: ["GET", "POST"],     // Allow only GET and POST methods
//   };
//   app.use(cors(corsOptions));


// for basic daefault protection
// can also customise it into middileware for more security
app.use(helmet())

// for api response ,payloads to compress the data to be send to client
app.use(compression({
    level:6,// mid level compression... 1 to 9 1 (fast, least compression) to (slow, high compression).
    threshold:0,//This means all responses will be compressed, regardless of size.
    // threshold: 1024, // compress data larger than 1024 kb
    filter: (req, res) => {
        if (req.headers["accept-encoding"]?.includes("gzip")) {
            return true; // Enable compression if client supports gzip
        }
    
        if (req.headers["x-no-compression"]) {
            return false; // Disable compression if client explicitly requests no compression
        }
    
        return compression.filter(req, res); // Use default behavior
    },
}))

// for standalone use 
// app.use(morgan("dev"))
// Morgan with logger 
app.use(morgan("combined", { stream: {write:(message)=> logger.info(message.trim()) }}))
app.use(requestLogger)


// for succes handling
app.use(successHandler)

// for rate limiting
app.use(tokenBucketLimiter("rate:global",{}))
// Routes
app.use("/api/auth",authRoute)
app.use("/api/task",taskRoute)
app.use("/api/user",userRoute)
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling no route middleware
app.use(notFoundHandler)
// Global error handler
app.use(errorHandler)
export default app





