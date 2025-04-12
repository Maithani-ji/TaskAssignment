import express from "express"
import { deleteUser, getUserByEmail } from "../controllers/userController.js"
import { headerAuthentication } from "../middilewares/headerAuthHandler.js"
import { validate } from "../middilewares/validateHandler.js"
import { userByEmailValidationRules, userDeleteValidationRules } from "../validators/userValidator.js"
const userRoute=express.Router()


userRoute.post("/user-by-email",headerAuthentication,userByEmailValidationRules(),validate,getUserByEmail)
userRoute.delete("/delete-user/:id",headerAuthentication,userDeleteValidationRules(),validate,deleteUser)
export default userRoute