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

// delete user with cascading deletion
export const deleteUser=async(req,res,next)=>{
    logger.info("Deleting user with cascading delete of refresh token after authentication and validation")
    try {
        //  already checking user in schema middilware of pre(findOneAndDelete)
        const user = await User.findOneAndDelete({_id:req.params.id})
      
        res.success(200,"User deleted successfully",{user})
    } catch (error) {
        next(error)
    }
}

