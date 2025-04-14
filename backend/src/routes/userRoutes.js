import express from "express"
import { deleteUser, deleteUserWithTransaction, getUserByEmail } from "../controllers/userController.js"
import { headerAuthentication } from "../middilewares/headerAuthHandler.js"
import { validate } from "../middilewares/validateHandler.js"
import { userByEmailValidationRules, userDeleteValidationRules } from "../validators/userValidator.js"
import { transactionHandler } from "../middilewares/transactionHandler.js"
const userRoute=express.Router()


userRoute.post("/user-by-email",headerAuthentication,userByEmailValidationRules(),validate,getUserByEmail)
userRoute.delete("/delete-user/:id",headerAuthentication,userDeleteValidationRules(),validate,deleteUser)
userRoute.delete("/delete-user_with-transaction/:id",headerAuthentication,userDeleteValidationRules(),validate,transactionHandler(deleteUserWithTransaction))

export default userRoute