
import { logger } from "../config/logger.js";
import prisma from "../prisma/client.js";

export const signup=async(req,res,next)=>{
    logger.info("Signup process started")
    try {
        const {name,email,password,role="EMPLOYEE"}=req.body

        const user= await prisma.user.findUnique({where:{email}})
        if(user)
        {
            const error=new Error("User already exists")
            error.status=409
            throw error
        }

        const newUser=await prisma.user.create({data:{name,email,password,role}})

        res.success(201,"User created successfully",newUser)
    } catch (err) {
        next(err)
    }
}

export const login=async(req,res,next)=>{
    logger.info("Login process started")
    try {
        const {email,password}=req.body

        const user=await prisma.user.findUnique({
            where:{email},
        })
        if(!user)
        {
            const error=new Error("User not found")
            error.status=404
            throw error
        }
        if(user.password!==password)
        {
            const error=new Error("Invalid Password")
            error.status=401
            throw error
        }

        res.success(200,"User logged in successfully",user)
    } catch (err) {
        next(err)
    }
}

export const updateUser=async(req,res,next)=>{
    logger.info("Update user process started")
    try {
        logger.info("Update user process started")
        const id=Number(req.params.id)

        const {name,email,password}=req.body
        const user =await prisma.user.update({where:{id},data:{name,email,password}})
        res.success(200,"User updated successfully",user)
    } catch (err) {
        next(err)
    }
}

export const createTask=async(req,res,next)=>{
    logger.info("Create task process started")
    try {
        const {title,description,userId}=req.body
       const dueDate=new Date(req.body.dueDate)
        const task=await prisma.task.create({data:{title,description,dueDate,userId}})
        res.success(201,"Task created successfully",task)
    } catch (err) {
        next(err)
    }
}
export const getTasks=async(req,res,next)=>{
    logger.info("Get tasks process started")
    try {
        const {userId}=req.query 
        const tasks= await prisma.task.findMany(
            {
                where:{userId:Number(userId)},
                select:{
                    title:true,
                    description:true,
                    dueDate:true,
                    id:true,
                    


                    user:{
                        select:{
                            name:true,
                            id:true,
                        },
                    },
                },//for the tasks

                // use above or below , both select and include wont work together
               
                // include:{user:false},

                // include:{
                //     user:{
                //         select:{
                //             name:true,
                //         },
                //     }},
                
       

            },
        )


       // // using raw query 
       
        // const tasks=await prisma.$queryRaw`SELECT * FROM "User" u LEFT JOIN "Task" t ON u.id=t."userId" WHERE u.id=${Number(userId)}`

        res.success(200,"Tasks fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}

export const getTaskPaginated=async(req,res,next)=>{
    try {
        logger.info("Get task paginated process started")
        const {userId,limit=3,page=1,search,status}=req.query
        const filter={
            userId:Number(userId),
            dueDate:{
                gte:new Date(),
            },
            ...(status && {status}),
            ...(search && {
                OR:[
                    {title:{contains:search ,mode:"insensitive"}},
                    {description:{contains:search,mode:"insensitive"}},
                ],
            }),
        }
        const tasks= await prisma.task.findMany(
            {
                where:filter,
                skip:(page-1)*Number(limit),
                take:Number(limit),
                select:{
                    title:true,
                    description:true,
                    dueDate:true,
                    id:true,
                    status:true,
                    user:{
                        select:{
                            name:true,
                            id:true,
                        },
                    },
                },
                orderBy:{
                    createdAt:"asc",
                },

            },
        )
       
        const total= await prisma.task.count({
            where:filter,
        })
        const totalPages= Math.ceil(total/limit)
        res.success(200,"Tasks fetched successfully",{
            tasks,
            pagination:{
                currentPage:page,
                pageSize:limit,
                totalPages,
                totalData:total,
                hasNextPage:page<totalPages,
                hasPrevPage:page>1,
            },
        })
        } catch (error) {
        next(error)
    }
}

export const getTaskAggregation=async(req,res,next)=>
{
    logger.info("Get task aggregation process started")
    try {
        const tasks=await prisma.task.groupBy(
            {
                by:["status","userId"],
                _count:{ _all:true },
            },
        )
        res.success(200,"Task aggregation fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}

export const cascadeDeletion= async(req,res,next)=>{
    logger.info("Cascade deletion process started")
    try {
        const {id}=req.params
      const data=await prisma.$transaction( async(tx)=>{
        const tasks=await tx.task.deleteMany(
            {
                where:{
                    userId:Number(id),
                },
            },
        )

        const user =await tx.user.delete(
            {
                where:{
                   id:Number(id),
                },
                
            },
        )

        return {tasks,user}
      })
      res.success(200,"Data deleted successfully",data)
    } catch (error) {
        next(error)
    }
}


export const getTaskByRaw=async(req,res,next)=>{
    try {
        logger.info("get task by raw query")
 
        const {id}=req.params
        
        // $queryRaw for raw query for SELECT ie only for get and not for insert .uupdate ,delete return rows 

        const tasks=await prisma.$queryRaw`SELECT * FROM "Task" WHERE "userId"=${Number(id)}`
       
        //  $executeRaw for insert update and delete op , doesnt return objecy ,just no of affected rows
        
        // const tasks=await prisma.$executeRaw`SELECT * FROM "Task" WHERE "userId"=${Number(id)}`
//    O/P NUMBER OF ROWS AFFECTED
    res.success(200,"Task fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
    
    
}

//  using custom function in postgresql

export const getOverDueTasks=async(req,res,next)=>{
    try {
        logger.info("Get over due tasks process started")
    //     make this function run on start of sql initialization not on everycall
    //  create a diff migration  file ,add the raw sql code 
        await prisma.$executeRawUnsafe(`CREATE OR REPLACE FUNCTION get_over_due_tasks(due_date DATE)
        RETURNS INT AS 
        $$
        BEGIN
        RETURN GREATEST(0,DATE_PART('day',NOW()-due_date));
        END
        $$ LANGUAGE plpgsql;
        `)

        const tasks = await prisma.$queryRawUnsafe(`
            SELECT *, get_over_due_tasks("dueDate"::DATE) AS "overdueDays"
            FROM "Task"
            WHERE get_over_due_tasks("dueDate"::DATE) > 0;
          `);
        res.success(200,"Tasks fetched successfully",tasks)
    } catch (error) {
        next(error)
    }
}