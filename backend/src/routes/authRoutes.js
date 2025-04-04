import express from "express"
import { accessToken, register, signIn, signOut, verifyEmail } from "../controllers/authController.js"
import { accessTokenValidationRules, registrationValidationRules, siginingInValidationRules, signingOutValidationRules } from "../validators/authValidator.js"
import { validate } from "../middilewares/validateHandler.js"
import { headerAuthentication } from "../middilewares/headerAuthHandler.js"

const authRoute = express.Router()
// Routes with request handlers like authorization headers and data validation from various requests 
authRoute.post("/register",registrationValidationRules(),validate,register)
authRoute.get("/verify-email",verifyEmail)
authRoute.post("/sign-in",siginingInValidationRules(),validate,signIn)
authRoute.post("/sign-out",headerAuthentication,signingOutValidationRules(),validate,signOut)
authRoute.post("/access-token",accessTokenValidationRules(),validate,accessToken)
export default authRoute