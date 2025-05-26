
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