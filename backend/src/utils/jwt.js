import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { logger } from "../config/logger.js"
dotenv.config()

// ACCESS Token
export const generateAccessToken=(user)=>{
    logger.info("Generating Access Token for User")
    // Generate access token with user id and secret key and expiration time of 15 minutes
    // this token will be used for authenticated access 
return jwt.sign({userId:user?._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"15m"})
}

export const verifyAccessToken=(token)=>{
    logger.info("Verifying Access Token")
    // verifying access token which return err or decoded data
    return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
}

// REFRESH Token
export const generateRefreshToken=(user)=>{
    logger.info("Generating Refresh Token for User")
    // Generate refresh token with user id and secret key and expiration time of 1 week
    // this token will be used for refreshing access token
return jwt.sign({userId:user?._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn:"7d"})
}

export const verifyRefreshToken=(token)=>{
    logger.info("Verifying Refresh Token")
    // verifying refresh token which return err or decoded data
    return jwt.verify(token,process.env.REFRESH_TOKEN_SECRET)
}