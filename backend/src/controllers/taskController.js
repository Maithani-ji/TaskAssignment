import mongoose from "mongoose";
import { logger } from "../config/logger.js";
import Task from "../models/Task.js";
import { Room } from "../models/Room.js";
import { paginateWithSkipLimit } from "../utils/pagination.js";
import { getFullMedaUrl } from "../utils/publicUrlMediaMaker.js";


// create task
// Create task and associated chat room
export const createTask = async (req, res, next) => {
    try {
      logger.info("🔧 Creating a new task");
  
      const { title, description, dueDate, assignedTo } = req.body;
  
      // Handle media uploads if any
      let mediaUrl = [];
      if (req.files && req.files.length > 0) {
        logger.info("🖼️ Media files detected — generating URLs");
        mediaUrl = getFullMedaUrl(req);
      }
  
      // Create the task
      const task = await Task.create({
        title,
        description,
        dueDate,
        assignedTo,
        media: mediaUrl,
      });
  
      logger.info("✅ Task created. Now creating room...");
  
      // Create the chat room for this task
      const room = await Room.create({
        task: task._id,
        members: [
         new mongoose.Types.ObjectId(task.assignedTo),
         new mongoose.Types.ObjectId(req.decoded.userId),
        ],
        createdBy: new mongoose.Types.ObjectId(req.decoded.userId),
      });
  
      logger.info("🎉 Task and Room created successfully");
  
      return res.success(201, "Task and room created successfully", {
        task,
        room,
      });
    } catch (error) {
      logger.error("❌ Error in createTask controller", error);
      next(error);
    }
  };

// get all tasks with sacalar pagiantion
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
// get all task with cursor pagination
export const getTasksWithCursor=async(req,res,next)=>{
try {
    const limit=parseInt(req.query.limit)||10;
    const cursor=req.query.cursor;

    const direction=req.query.direction ||"next"
    const query={}

    // cursor filter based on direction
    if(cursor)
    {
        // since we go from latest to oldest
        const cursorId=new mongoose.Types.ObjectId(cursor)
        query._id=direction==="next"
        ? 
        {$lt: cursorId}//fetch older item for next page
        :
        {$gt:cursorId}// fetch newer item for previous page
    }
    const sortOrder= direction==="next"? -1:1;// newest to oldest

    let items=await Task.find(query).sort({_id:sortOrder}).limit(limit+1).populate({ path:"assignedTo",select:"-password" }).lean()
    //  sorting based on cursor field and limit +1 to see if there is next page or not
    const hasMore=items.length>limit
    if(hasMore)
    {
        items.pop()
    }
    if(direction==="prev" && items.length >0)
    {
        items=items.reverse()//to match the sequence othersie it wont be arranged like new to old
    }
    let nextCursor = null;
    let prevCursor = null;

    if (direction === "next") {
        nextCursor = hasMore ? items[items.length - 1]?._id : null;
        prevCursor = cursor ? items[0]?._id : null;
      } else {
        // direction === "prev"
        nextCursor = cursor ? items[items.length - 1]?._id : null;
        prevCursor = hasMore ? items[0]?._id : null;
      }


    res.success(200,"Tasks fetched successfully",{tasks:items,nextCursor,prevCursor})
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
// get overdue status of a task
export const getOverdueStatus=async(req,res,next)=>{
    try {
        logger.info("Getting overdue status of a task after authentication and validation")

        const task=await Task.findById(req.params.id)
        if(!task){
            const error=new Error("Task not found")
            error.status=404
            throw error
        }
        const status= await task.getOverdueStatus()
        res.success(200,"Overdue status fetched successfully",{status})
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

// aggregation pipelines

// task status summary by grouping
export const getTaskSummary=async(req,res,next)=>{
    try {
        logger.info("Getting task status summary after authentication and validation")
      const pipeline=[{$group:{_id:"$status",count:{$sum:1}}}]
        const tasks=await Task.aggregate(pipeline)
        res.success(200,"Task status summary fetched successfully",tasks)
    } catch (error) {
        next(error)
    }

}
// no of tasks assigned to a user 

export const getTasksCountByUser=async(req,res,next)=>{
    try {
        logger.info("Getting task count of a user after authentication and validation")
        const pipeline=[{$match:{assignedTo: new mongoose.Types.ObjectId(req.params.id)}},{
            $count:"Tasks",
        }]
        const tasks=await Task.aggregate(pipeline)
        res.success(200,"Task count of a user fetched successfully",tasks)

    } catch (error) {
        next(error)
    }
}

// get tasks due this week

export const getTasksDueByMonth=async(req,res,next)=>{
    try {
        logger.info("Getting task due by months  after authentication and validation")
        const startMonth= new Date()
        startMonth.setMonth(new Date().getMonth())
        const endMonth=new Date()
        endMonth.setMonth((new Date().getMonth())+2)
        console.log(startMonth,endMonth);
        // const startMonth= new Date()
        // startMonth.setMonth(new Date().getMonth())
        // startMonth.setHours(0,0,0,0)
        // const endMonth=new Date()
        // endMonth.setMonth((new Date().getMonth())+2)
        // endMonth.setHours(0,0,0,0)
        // console.log(startMonth,endMonth);

        
// bonus tip  If you want to include everything until the end of the second month, you can do:

// endMonth.setMonth(endMonth.getMonth() + 1);
// endMonth.setDate(0); // goes to last day of the month
// endMonth.setHours(23, 59, 59, 999);
        const pipeline=[{$match:{dueDate:{$gt:startMonth,$lte:endMonth}}},
            {$sort:{dueDate:1}},
            // {$count:"tasks"},
            {$facet:{
                tasks:[
                    {
                    $lookup:{
                    from:"users",
                    localField:"assignedTo",
                    foreignField:"_id",
                    as:"assignedTo",
                }},
                {
                    $unwind:"$assignedTo",
                },
                {
                    $project:{
                       "assignedTo.password":0,
                    },
                },

            ],
                totalCount:[{$count:"tasks"}],
            }},
        ]
        const tasks=await Task.aggregate(pipeline)
        res.success(200,"Task due by month fetched successfully",tasks)

    }
    catch(error)
    {
        next(error)
    }
}
// get top 3 users with most completed task
export const getTopEmployee=async(req,res,next)=>{
    try {
        logger.info("Getting top employee after authentication and validation")
        const pipeline=[
            {
            $match:{status:"completed"},
        },
            {
                $group:{
                _id:"$assignedTo",
                completedTask:{$sum:1},
            }},
            {
                $facet:{
                    task:[
                        {
                    $lookup:{
                        from:"users",
                        localField:"_id",
                        foreignField:"_id",
                        as:"assignedTo",
                    }},
                    {$unwind:"$assignedTo"},
                    {
                        $match:{
                            "assignedTo.role":"employee",
                        },
                    },
                   { $project:
                    {
                     "assignedTo.name":1,
                    //  "assignedTo.email":1,
                     "assignedTo.role":1,
                     completedTask:1,
                    },
                    },
                    
                ],
                },
            },
        ]
        const tasks=await Task.aggregate(pipeline)
        res.success(200,"Top employee fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}

// get overdue task group by user
export const getOverdueTaskByUser=async(req,res,next)=>{
    try {
        logger.info("Getting overdue task by user after authentication and validation")
        const pipeline=[
            {
                $match:{status:"pending",dueDate:{$lt:new Date(2026,1,1)}},
            },
            {
                $group:{
                    _id:"$assignedTo",
                    overdueTask:{$sum:1},
                },
            },
            {
                $sort:{overdueTask:-1},
            },
            {
                $facet:{
                    task:[
                        {
                            $lookup:{
                                from:"users",
                                localField:"_id",
                                foreignField:"_id",
                                as:"assignedTo"},
                        },
                        {
                            $unwind:"$assignedTo",
                        },
                        {
                            $project:
                            {
                                "assignedTo.name":1,
                                "assignedTo.email":1,
                                "assignedTo.role":1,
                                overdueTask:1,
                            },
                        },
                    ],
                },
            },
        ]
        const tasks= await Task.aggregate(pipeline)
        res.success(200,"Overdue task by user fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}
//  get monthly task ompleted trend
export const getMonthlyTaskCompletedTrend=async(req,res,next)=>{
    try {
        logger.info("Getting monthly task completed trend after authentication and validation")
        const pipeline=[
            {
                $match:{status:"completed"},
            },
            {
                $group:{
                    _id:{month:{$month:"$updatedAt"},year:{$year:"$updatedAt"}},
                    completedTask:{$sum:1},
                },
            },
            {
                $sort:{"_id.month":-1,"_id.year":-1},
            },
        ]
        const tasks=await Task.aggregate(pipeline)
        res.success(200,"Monthly task completed trend fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}