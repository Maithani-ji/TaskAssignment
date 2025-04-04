import express from "express"
import { register, signIn, signOut, verifyEmail } from "../controllers/authController.js"
import { registrationValidationRules, siginingInValidationRules, signingOutValidationRules } from "../validators/authValidator.js"
import { validate } from "../middilewares/validate.js"

const authRoute = express.Router()

authRoute.post("/register",registrationValidationRules(),validate,register)
authRoute.get("/verify-email",verifyEmail)
authRoute.post("/sign-in",siginingInValidationRules(),validate,signIn)
authRoute.post("/sign-out",signingOutValidationRules(),validate,signOut)
export default authRoute