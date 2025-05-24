import Joi from "joi";
import { logger } from "../config/logger.js";

export const validateHandlerJoi = (schema) => {
    logger.info("Joi validation check started for req")
 return async (req, res, next) => {
    const options={
        abortEarly:false,//show all errors
        allowUnknown:true ,//ignore unknown fields
        stripUnknown:true,//remove unknown fields
    }
        try {
         const {error,value}=  schema.validateAsync(req.body,options);
            if (error) {
                const error = 
                 new Error(error.details.map((detail) => detail.message).join(", "));
                 error.status = 400;
                throw error;
            }
            req.body=value
            next();
        } catch (error) {
           next(error)
        }
    };
};