import { logger } from "../config/logger.js";
import { RefreshToken } from "../models/RefreshToken.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { createCascadeDeleter } from "../utils/cascadeDeleteFactory.js";


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

// delete user with cascading deletion using user schema middileware 
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

//  delete user with cascading deletion using transaction middileware usign session and all

export const deleteUserWithTransaction = async (req, res, next) => {
    const { id } = req.params; // Get the user ID from request params
    const session = req.session; // Get the session from request

    try {
        logger.info("Deleting user with cascading delete of refresh token using transaction");

        // Create the cascade deleter for User with RefreshToken dependency
        const deleterMethod = await createCascadeDeleter({
            model: User, // Main model: User
            dependencies: [{ model: RefreshToken, field: "userId" },
                {model: Task,field:"assignedTo"},
            ] ,// Dependency: RefreshToken
        });

        // Call the cascade deleter method and pass the user ID and session
        const deletedUser =  await deleterMethod(id, session);

        // Send response with deleted user data
        res.success(200, "Cascading deletion done for user and refresh token", { deletedUser });
    } catch (error) {
        next(error); // Propagate error if any occurs
    }
};

