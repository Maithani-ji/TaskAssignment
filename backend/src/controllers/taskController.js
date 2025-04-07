import { logger } from "../config/logger.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

// create task
export const createTask=async(req,res,next)=>{
    try {
    logger.info("Creating a new task after validation and authentication")

    const{title,description,dueDate,assignedTo}=req.body

   
    const task= await Task.create({title,description,dueDate,assignedTo})
    logger.info("Task created successfully")
    res.success(201,"Task created successfully",{task})
} catch (error) {
        next(error)
}
}

// get all tasks
export const getTasks=async(req,res,next)=>{
    try {
    logger.info("Getting all tasks after authentication and validation")
    // way to get particaular data from db
    
    // const tasks=await Task.find({status:"pending"}, "title description status dueDate")
    const tasks=await Task.find().
      populate({ path:"assignedTo",select:"name email role" }).lean()
    logger.info("All Task fetched successfully")
    res.success(200,"Tasks fetched successfully",{tasks})
} catch (error) {
        next(error)
}
}