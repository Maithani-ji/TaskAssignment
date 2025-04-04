import { validationResult } from "express-validator";
import { logger } from "../config/logger.js";

export const validate=(req,res,next)=>
{
    logger.info("Validation check started")

const errors=validationResult(req);

if(!errors.isEmpty()){
const error= new Error(`Validation Failed, ${errors.array().map((item)=>item.msg).join(",")}`);
error.statusCode=400;
error.data=errors.array().map((item)=>item.msg)
return next(error)
}
logger.info("Validation check finished")
next()
}