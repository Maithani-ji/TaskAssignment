import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./logger.js";
dotenv.config(); 

const mongoUrl = process?.env?.MONGO_URL;


export const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl);
        // console.log("Connected to MongoDB successfully");
        logger.info("Connected to MongoDB successfully")
    } catch (error) {
        // console.error("Error connecting to MongoDB:", error.message);
        logger.error("Error connecting to MongoDB:", error)
        process.exit(1); // Exit process with failure
    }
};

export const closeDB = async () => {
    try{
 await mongoose.connection.close()
    logger.info("DB CLOSED SUCCESSFULLY")
    }
    catch(err){
    logger.error("Error closing MongoDB connection:",err)
    }
}