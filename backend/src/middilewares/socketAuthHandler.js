import { logger } from "../config/logger.js"
import { verifyAccessToken } from "../utils/jwt.js"

export const socketAuthentication=(socket,next)=>{
    logger.info("Socket Authentication started")
    
    try {
    const token=socket.handshake.auth.token
    logger.info(`Token Received: ${token}`);

    if(!token)
    {
        logger.warn("No access token")
        return next(new Error("Socket Authentication Failed : No access token"))
    }
    const decoded=verifyAccessToken(token)
    logger.info("Socket Authentication Success")
    next()
    } catch (err) {
        logger.error("Socket Authentication Failed",err.message)
        next(new Error("Socket Authentication Failed"))
    }
    
}