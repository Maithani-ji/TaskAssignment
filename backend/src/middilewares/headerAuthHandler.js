import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const headerAuthentication= (req,res,next)=>{
    logger.info("Header authorization started")

    //  validate header authorization
    if(!req?.headers?.authorization)
    {
        logger.info("Header authorization failed")
        const error =new Error("Authorization header not found")
        error.status=401;
        return next(error);
    }
   
    
    const token= req?.headers?.authorization?.split(" ")[1]
    
    // validate token
    if(!token){
        logger.info("Header authorization Failed")
        const error =new Error("Access Token not found")
        error.status=401;
        return next(error);
    }
    try {
       const decoded= verifyAccessToken(token)
    //    sending decoded in request as decoded key not in any body ,query or params
       req.decoded=decoded;
       
       
    } catch (err) {
        logger.info("Header authorization failed")
        const error =new Error(err.message || "Inavlid access token")
        error.status=401;
        return next(error);
    }
    logger.info("Header authorization successfull")
    next()
}