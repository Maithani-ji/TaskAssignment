import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User.js";

export const register = async (req, res) => {
    try {
        console.log("Request Body:", req.body); // ✅ Check what data is coming

        const { name, email, password} = req.body;

        // ✅ Validate inputs
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // ✅ Create user
        const user = await User.create({ name, email, password: hashedPassword, verificationToken });

        res.status(201).json({ message: "User Registered. Check your email for verification...", data: user });

    } catch (error) {
        // console.error("🔥 Registration Error:", error); // ✅ Show error in server logs
        res.status(500).json({
            message: "Registration Failed",
            error: error.message, // ✅ Show error message
            stack: error.stack,   // ✅ Optional: Show error stack trace
        });
    }
};
