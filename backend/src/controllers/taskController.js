import { logger } from "../config/logger.js";
import Task from "../models/Task.js";
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

// get a particular task
export const getTaskById=async(req,res,next)=>{
    try {
        
        logger.info(`Getting a particular task after authentication and validation for ${req.params.id}`)

        const task=await Task.findById(req.params.id).populate({ path:"assignedTo",select:"-password" }).lean()

    if(!task)
        {
          const error=new Error("Task not found")
          error.status=404
         throw error
        }
        res.success(200,"Task fetched successfully",task)
    } catch (error) {
       next(error) 
    }
} 

//  get all task for a user 
export const getTasksByUser=async(req,res,next)=>{
    try {
        logger.info("Getting all tasks for a user after authentication and validation")

        const tasks= await paginateWithSkipLimit(Task,{...req.query,filter: {
            ...(req.query.filter || {}),
            assignedTo: req.params.id,
          },
        });
        if(!tasks)
        {
            const error=new Error("Tasks not found")
            error.status=404
            throw error
        }
        res.success(200,"Tasks fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}

// update task 
export const updateTaskById=async(req,res,next)=>{
    try {
        logger.info("Updating a task after authentication and validation")

        // 1st  approach without using update keyword

        // const task = await Task.findById(req.params.id);
        // task.status = "completed";
        // await task.save();

        // 2nd using update keyword , like the first find will get updated but no treturn resulted task but an acknowledgement object

        // const task = await Task.updateOne({_id:req.params.id},req.body, {runValidators:true});

        // 3nd approach using find && update keyword or find One and update ,same like  updateOne but give resulted task 

        const task =await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        if(!task)
        {
            const error=new Error("Task not found")
            error.status=404
            throw error
        }
        res.success(200,"Task updated successfully",task)
    } catch (error) {
        next(error)
    }
}

// deletd task
export const deleteTaskById=async(req,res,next)=>{
    try {
        logger.info("Deleting a task after authentication and validation")
        const task=await Task.findByIdAndDelete(req.params.id)
        if(!task)
        {
            const error=new Error("Task not found")
            error.status=404
            throw error
        }
        res.success(200,"Task deleted successfully",task)
    } catch (error) {
        next(error)
    }
}