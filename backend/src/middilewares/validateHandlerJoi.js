
import { logger } from "../config/logger.js";

export const validateHandlerJoi = (schema) => {
    logger.info("Joi validation check started for req")
    
 return async (req, res, next) => {
    const options={
        abortEarly:false,//show all errors
        allowUnknown:true ,//ignore unknown fields
        stripUnknown:true,//remove unknown fields
    }
    console.log(req.body);
    
    try {
        const value = await schema.validateAsync(req?.body, options);
        req.body = value;
        next();
      } catch (error) {
        const validationError = new Error(
          error.details.map((detail) => detail.message).join(", "),
        );
        validationError.status = 400;
        next(validationError);
      }
    };
};