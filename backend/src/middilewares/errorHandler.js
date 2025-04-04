import { logger } from "../config/logger.js";

//  global error handler middleware

export const errorHandler =(err,req,res,next) => {
    const statusCode=err.status || 500
    const message =err.message || "Internal server Error"
    logger.error("Error",{message,stack:err.stack})
    const data=err.data || null
    res.status(statusCode).json({
        success:false,
        message,
        ...(data && {data:data}),
        // stack: err.stack || null,  // Optional: Show error stack trace
    })
    next()
}
// Not found handler 
export const notFoundHandler=(req,res,next)=>{
    logger.error("Error on routing ",{message:"Route not found ",stack:null})
res.status(404).json({
    success:false,
    message:"Route Not Found",
})
next()
}