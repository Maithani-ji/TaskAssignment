import crypto from "crypto";
import bcrypt from "bcrypt"; 
import User from "../models/User.js";
import { logger } from "../config/logger.js";
import { sendVerificationEmail } from "../service/emailService.js";
import { generateAccessToken, generateRefreshToken } from "../service/tokenService.js";
import { RefreshToken } from "../models/RefreshToken.js";


// Registering new user 
export const register = async (req, res,next) => {
    try {
        
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
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            const error= new Error(`User already exists with :${email} `);
            error.status=400;
            throw error
            
        }

        // ✅ Hash password & verification token
        const salt= await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        // ✅ Create user
        const user = await User.create({ name, email, password: hashedPassword, verificationToken });
       
        // ✅ Send success response
        res.success(201,"User created succesfully & Email Verification is being sent")
        
       // ✅ Call email service separately && for larger we can create seperate api call for this which redirect to that mail sending api
       
        await sendVerificationEmail({ email: user.email, verificationToken: user.verificationToken });
    
    } catch (error) {
      
       next(error)
    }
};
// verify new user
export const verifyEmail= async(req,res,next)=>{
    try {
        logger.info("Verifying email started")
        const {verification_token} = req.query;
        
        const user = await User.findOne({verificationToken:verification_token}).lean();
        if(!user)
        {
            const error =new Error("Email Verification failed .User not found with verification token or token is expired !")
            error.status=404;
            throw error;
        }
        user.verificationToken = null;
        user.isVerified=true;
        await user.save();

        res.success(200,"Email Verified Successfully")
       
    } catch (error) {
        next(error)
    }
}

// sign in user
export const signIn=async(req,res,next)=>{
    try {
        const {email,password} = req.body;
        // check fields if any missing
        if(!email || !password)
        {
            const error=new Error("Missing required fields for sign In.")
            error.status=400;
            throw error;
        }
        logger.info(`Sign in process started for : ${email}`)

        const user =await User.findOne({email}).lean();
        // check if any user is present for that login or not 
        if(!user)
        {
            const error=new Error(`User not found with email : ${email} `);
            error.status=404;
            throw error;
        }
        // if user id active or not if any present
        if(user && !user?.isVerified)
        {
            const error=new Error("User is not verified. Please verify your email first.")
            error.status=403;
            throw error;
        }
        
        const isMatch=await bcrypt.compare(password,user.password);
        
        // if password  entered is same 
        if(!isMatch){
            const error=new Error("Invalid Password")
            error.status=401;
            throw error;
        }
        // Authenticated Access Token generated 
        const accessToken= generateAccessToken(user)
        const refreshToken= generateRefreshToken(user)

        // saving refresh token in RefreshToke db
        logger.info("Saving refresh token in RefreshToken db")
        const refresh_token= await RefreshToken.create({userId:user?._id,token:refreshToken,expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)})
        // User data without password field for response 
       const userCopy={...user}
       delete userCopy.password;

       res.success(200,"Logged in Successfully",{user:userCopy,accessToken,refreshToken:refresh_token})
    } catch (error) {
        next(error)
    }
}

// sign out user which will have header of access token
export const signOut = async (req, res, next) => {
    try {
        logger.info("Sign Out process started");

        // Extract refresh token from cookies or request body
        const refreshToken =  req.body.refreshToken || req.cookies.refreshToken ;
        // Extract type and userId from request body, defaulting type to "One"
        const { type = "One", userId } = req.body;

        // If logging out from a single session
        if (type === "One") {
            if (!refreshToken) {
                const error = new Error("Missing refresh token id for particular signout");
                error.status = 400;
                throw error;
            }
            // Log the action before deleting the refresh token
        logger.info("Deleting a specific refresh token from RefreshToken db");
            // Delete the refresh token from the database
        await RefreshToken.deleteOne({ token: refreshToken });

            // Clear refresh token cookie if it exists
        if (req.cookies.refreshToken) {
                res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });
            }
        } 
        
        // If logging out from all sessions
        else if (type === "All") {
            // Ensure userId is provided for logging out from all sessions
        if (!userId) {
                const error = new Error("Missing user id for all sign out");
                error.status = 400;
                throw error;
            }

            logger.info("Deleting all refresh tokens for this user");
            // Delete all refresh tokens associated with the user
        await RefreshToken.deleteMany({ userId });

            if (req.cookies.refreshToken) {
                res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });
            }
        }

        // Respond with success message after logout
                res.status(200).json({ success: true, message: "Logged out Successfully" });
    } catch (error) {
        next(error);
    }
};
