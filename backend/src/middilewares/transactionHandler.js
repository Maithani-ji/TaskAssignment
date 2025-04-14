import mongoose from "mongoose";
import { logger } from "../config/logger.js";


export const transactionHandler = (handler) => async (req, res, next) => {
    const session = await mongoose.startSession();
    logger.info(" Transaction session started");

    try {
        req.session = session;
        session.startTransaction();
        logger.info(" Transaction started");

        await handler(req, res, next);

        await session.commitTransaction();
        logger.info(" Transaction committed successfully");
    } catch (error) {
        await session.abortTransaction();
        logger.error(" Transaction aborted due to error:", error);
        next(error);
    } finally {
        await session.endSession();
        logger.info(" Transaction session ended");
    }
};
