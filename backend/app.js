
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import express from "express";

import dotenv from "dotenv";
import morgan from "morgan";

import cookieParser from "cookie-parser";

import { requestLogger } from "./src/middilewares/requestLogger.js";
import { logger } from "./src/config/logger.js";
// Api  Routes 
import authRoute from "./src/routes/authRoutes.js" 
import taskRoute from "./src/routes/taskRoutes.js";
import userRoute from "./src/routes/userRoutes.js";
import userSqlRoute from "./src/routes/userSqlRoutes.js";
// Error middlewares
import { errorHandler, notFoundHandler } from "./src/middilewares/errorHandler.js";
import { successHandler } from "./src/middilewares/succesHandler.js";
import { tokenBucketLimiter } from "./src/middilewares/rateLimitterHandler.js";
import { securityMiddlewares } from "./src/middilewares/securityHandler.js";


// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
dotenv.config(); 

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));  // Optional: for form data

// Use cookie-parser middleware
app.use(cookieParser());

// security middleware
app.use(securityMiddlewares)


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
app.use("/api/userSql",userSqlRoute)
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Error handling no route middleware
app.use(notFoundHandler)
// Global error handler
app.use(errorHandler)
export default app





