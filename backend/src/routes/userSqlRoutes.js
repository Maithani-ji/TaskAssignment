import express from "express"
import { createTask, getTaskPaginated, getTasks, login, signup, updateUser } from "../controllers/userPrismaController.js"
import { validateHandlerJoi } from "../middilewares/validateHandlerJoi.js"
import { loginValidationRules } from "../validators/userSqlValidator.js"

const userSqlRoute=express.Router()

userSqlRoute.get("/get-users-task-sql",getTasks)
userSqlRoute.get("/get-tasks-paginate-sql",getTaskPaginated)
userSqlRoute.post("/sign-up-user-sql",signup)
userSqlRoute.post("/log-in-user-sql",validateHandlerJoi(loginValidationRules()),login)
userSqlRoute.put("/update-user-sql/:id",updateUser)
userSqlRoute.post("/create-task",createTask)

export default userSqlRoute