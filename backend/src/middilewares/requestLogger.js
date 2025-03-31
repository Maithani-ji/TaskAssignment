
import { logger } from "../config/logger.js";

// middle to log incoming request

export const requestLogger=(req,res,next)=>{
    const{method,url,body,params,query}=req;
    logger.info(`Request: ${method} ${url} `,{
        params,query,body,
    }),
    res.on("finish",()=>{
logger.info(`Response: ${res.statusCode} ${res.statusMessage}`)
    })
    next()
}