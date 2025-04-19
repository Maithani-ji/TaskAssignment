import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { logger } from "../config/logger.js";


const transporter=nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER?.trim() || "",
        pass: process.env.EMAIL_PASSWORD?.trim() || "",
    },
    // debug: true, // Enable debug output
    // logger: true, // Log information to console
})

export const sendVerificationEmail= async({email,verificationToken})=>{
    try {
        logger.info(`Email verification service started for ${email}`);
     
        
        const  verificationUrl=`${process.env.CLIENT_URL}/verify-email?verification_token=${verificationToken}`

        const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Action Required",
    html: `
        <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center;">
                <h2 style="color: #333;">Verify Your Email</h2>
                <p style="color: #555; font-size: 16px;">You're almost there! Please confirm your email address to activate your account.</p>
            </div>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${verificationUrl}" style="background-color: #007bff; color: #fff; text-decoration: none; padding: 12px 25px; font-size: 18px; border-radius: 5px; display: inline-block; font-weight: bold;">
                    Verify Email
                </a>
            </div>
            <p style="color: #777; font-size: 14px; text-align: center;">If you didn’t request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd;">
            <p style="color: #888; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
    `,
        };


        await transporter.sendMail(mailOptions)

        logger.info(`Verification service sent mail to ${email} `)

    } catch (error) {
        logger.error(`Email Verification Serivice Failed for ${email}`,error)
    }

}