import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { logger } from "../config/logger.js";

export const register = async (req, res,next) => {
    try {
        // console.log("Request Body:", req.body); // ✅ Check what data is coming
logger.info("Recieved Registration Request")
        const { name, email, password} = req.body;

        // ✅ Validate inputs
        if (!name || !email || !password) {
            // logger.warn("Validation failed : Missing required Fields")
            const error= new Error("Missing required Fields");
            error.status=400;
            throw error
        }

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error= new Error(`User already exists with :${email} `);
            error.status=400;
            throw error
            
        }

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // ✅ Create user
        const user = await User.create({ name, email, password: hashedPassword, verificationToken });
        res.success(201,"User created succesfully",user)

    } catch (error) {
      
       next(error)
    }
};
