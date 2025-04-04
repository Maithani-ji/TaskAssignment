import { logger } from "../config/logger.js";

export const successHandler=(req,res,next)=>{
    res.success=(statusCode=200,message="Success",data=null,meta=null)=>{
        logger.info(`[Success]: ${message}`)

        const response={
            success:true,
            message,
            ...(data && {data}),
        }
        if(meta)//if meta data available
        {
            response.meta=meta
        }
        if(req.id)//if any id in request 
        {
            response.requestId=req.id
        }

        res.status(statusCode).json(response)
    }
    next()
}