import { logger } from "../config/logger.js";
import User from "../models/User.js";

//  get email of user using static method of user schema
export const getUserByEmail=async(req,res,next)=>{
    try {
        logger.info("Getting user email after authentication and validation")
        const user = await User.getUserByEmailStaticMethod(req.body.email)
        if(!user)
        {
            const error=new Error("User not found")
            error.status=404
            throw error
        }
        res.success(200,"User email fetched successfully",{user})
    } catch (error) {
        next(error)
    }
}

