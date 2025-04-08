import { logger } from "../config/logger.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { paginateWithSkipLimit } from "../utils/pagination.js";

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

    const query=req.query
    // ways to get particaular data from db

    // 1ST WAY
    // const tasks=await Task.find({status:"pending"}, "title description status dueDate")

    // 2ND WAY
    // const tasks=await Task.find().populate({ path:"assignedTo",select:"name email role" }).lean()
    // logger.info("All Task fetched successfully")

    // 3RD WAY a basic paginateGenricMethod
    const tasks=await paginateWithSkipLimit(Task,query)
    res.success(200,"Tasks fetched successfully",tasks)
} catch (error) {
        next(error)
}
}