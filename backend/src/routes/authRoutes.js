import express from "express"
import { register, signIn, signOut, verifyEmail } from "../controllers/authController.js"

const authRoute = express.Router()

authRoute.post("/register",register)
authRoute.get("/verify-email",verifyEmail)
authRoute.post("/sign-in",signIn)
authRoute.post("/sign-out",signOut)
export default authRoute