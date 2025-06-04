import express from "express"
import { cascadeDeletion, createTask, getOverDueTasks, getTaskAggregation, getTaskByRaw, getTaskPaginated, getTasks, login, signup, updateUser } from "../controllers/userPrismaController.js"
import { validateHandlerJoi } from "../middilewares/validateHandlerJoi.js"
import { loginValidationRules } from "../validators/userSqlValidator.js"

const userSqlRoute=express.Router()

userSqlRoute.get("/get-users-task-sql",getTasks)
userSqlRoute.get("/get-tasks-paginate-sql",getTaskPaginated)
userSqlRoute.get("/get-tasks-aggregate-sql",getTaskAggregation)
userSqlRoute.get("/cascade-deletion-sql/:id",cascadeDeletion)
userSqlRoute.get("/get-task-by-raw/:id",getTaskByRaw)
userSqlRoute.get("/get-over-due-task-by-raw",getOverDueTasks)

userSqlRoute.post("/sign-up-user-sql",signup)
userSqlRoute.post("/log-in-user-sql",validateHandlerJoi(loginValidationRules()),login)
userSqlRoute.put("/update-user-sql/:id",updateUser)
userSqlRoute.post("/create-task",createTask)

export default userSqlRoute