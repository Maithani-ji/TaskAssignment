import express from "express"
import { getUserByEmail } from "../controllers/userController.js"
import { headerAuthentication } from "../middilewares/headerAuthHandler.js"
import { validate } from "../middilewares/validateHandler.js"
import { userByEmailValidationRules } from "../validators/userValidator.js"
const userRoute=express.Router()


userRoute.post("/user-by-email",headerAuthentication,userByEmailValidationRules(),validate,getUserByEmail)

export default userRoute