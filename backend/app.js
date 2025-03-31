import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./src/config/db.js";
import { requestLogger } from "./src/middilewares/requestLogger.js";
import { logger } from "./src/config/logger.js";
//  Auth Routes
import authRoute from "./src/routes/authRoutes.js" 
// Error middlewares
import { errorHandler, notFoundHandler } from "./src/middilewares/errorHandler.js";
import { successHandler } from "./src/middilewares/succesHandler.js";
 
dotenv.config(); 

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));  // Optional: for form data
app.use(cors())
//  CORS EXTRAS...

// const corsOptions = {
//     origin: "http://example.com",  // Allow only requests from this origin
//     methods: ["GET", "POST"],     // Allow only GET and POST methods
//   };
//   app.use(cors(corsOptions));

// for standalone use 
// app.use(morgan("dev"))
// Morgan with logger 
app.use(morgan("combined", { stream: {write:(message)=> logger.info(message.trim()) }}))
app.use(requestLogger)
// Connect to MongoDB
await connectDB();

// for succes handling
app.use(successHandler)

// Routes
app.use("/api/auth",authRoute)


// Global error handler
app.use(errorHandler)
// Error handling no route middleware
app.use(notFoundHandler)
export default app





