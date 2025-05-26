import express from "express"
import { createTask, login, signup, updateUser } from "../controllers/userPrismaController.js"
import { validateHandlerJoi } from "../middilewares/validateHandlerJoi.js"
import { loginValidationRules } from "../validators/userSqlValidator.js"

const userSqlRoute=express.Router()

userSqlRoute.post("/sign-up-user-sql",signup)
userSqlRoute.post("/log-in-user-sql",validateHandlerJoi(loginValidationRules()),login)
userSqlRoute.put("/update-user-sql/:id",updateUser)
userSqlRoute.post("/create-task",createTask)

export default userSqlRoute