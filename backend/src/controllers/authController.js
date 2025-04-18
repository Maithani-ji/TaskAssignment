import crypto from "crypto";
import bcrypt from "bcrypt"; 
import User from "../models/User.js";
import { logger } from "../config/logger.js";
import { sendVerificationEmail } from "../service/emailService.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { RefreshToken } from "../models/RefreshToken.js";
import {redisClient} from "../config/redis.js";


// Registering new user with $-express-validators
export const register = async (req, res,next) => {
    try {
        
        logger.info("Recieved Registration Request after validation")
        const { name, email, password} = req.body;

      

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email }).lean();
        if (existingUser) {
            const error= new Error(`User already exists with :${email} `);
            error.status=409; // conflict , duplicaate data
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
        
        const user = await User.findOne({verificationToken:verification_token});
        if(!user)
        {
            const error =new Error("Email Verification failed .User not found with verification token or token is expired !")
            error.status=401;
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
        logger.info(`Sign in process started for : ${email} after validation`)

        const user =await User.findOne({email}).lean();
        // check if any user is present for that login or not 
        if(!user)
        {
            const error=new Error(`User not found with email : ${email} `);
            error.status=401;//unauthorized or unauthenticated 401
            throw error;
        }
        // if user id active or not if any present
        if(user && !user?.isVerified)
        {
            const error=new Error("User is not verified. Please verify your email first.")
            error.status=403; // forbidden but authorized , unauthorized or unauthenticated 401
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


        //  saving refresh token in redis
        logger.info("Saving refresh token in redis")
        await redisClient.setEx(`refreshToken:${user._id}`, 60 * 60 * 24 * 7, refreshToken)



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

// sign out user which will have header authorization of access token
export const signOut = async (req, res, next) => {
    try {
        
        logger.info("Sign Out process started after its authorization  and validation");

        // Extract refresh token from cookies or request body
        const refreshToken =  req.body.refreshToken || req.cookies.refreshToken ;
        // Extract type and userId from request body, defaulting type to "One"
        const { type , userId } = req.body;
        
        
        // If logging out from a single session
        if (type === "One") {

            // Check if refresh token provided  is valid
        const tokenRecord = await RefreshToken.findOne({ token: refreshToken });

        if (!tokenRecord) {
          logger.warn("Invalid or already used refresh token");
        }
            //  deleting the refresh token if available
        logger.info("Deleting a specific refresh token from RefreshToken db");
            // Delete the refresh token from the database
        await RefreshToken.deleteOne({ token: refreshToken });

        }
        
        //  cehck
        // If logging out from all sessions
        else if (type === "All") {

            // Check if userId provided is valid
            const user=await User.findOne({_id:userId})
            if(!user)
            {
                logger.warn("User not found for the logged in sessions")
            }
            //  deleting all refresh tokens if user available
            logger.info("Deleting all refresh tokens for this user");
            // Delete all refresh tokens associated with the user
        await RefreshToken.deleteMany({ userId });

    
        }
          // Clear refresh token cookie if it exists
             if (req.cookies.refreshToken) {
                logger.info("Deleting refresh token from cookies");ß
               res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });
            }
            // clear refresh token from redis 
            logger.info("Deleting refresh token from redis")

           
            
            await redisClient.del(`refreshToken:${req.decoded.userId}`)
            // console.log(req.decoded.userId);
        // Respond with success message after logout
                res.status(200).json({ success: true, message: "Logged out Successfully" });
    } catch (error) {
        next(error);
    }
};

// new access token initilaization if older get expired only if refresh token is active
export const accessToken = async (req, res, next) => {
    try {
      logger.info("Acess token generation started after validation");
  
      const refreshToken =  req.body.refreshToken || req.cookies.refreshToken ;
      // verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      const { userId } = decoded;
    // check if refresh token is valid in redis
    const refreshTokenRedis=await redisClient.get(`refreshToken:${userId}`)
    console.log(refreshTokenRedis);
    
    if(!refreshTokenRedis || refreshTokenRedis!==refreshToken)
    {
        const error=new Error("Invalid refresh token")
        error.status=401;
        throw error
    }
  
      // Find user by ID
      const user = await User.findById(userId).lean();
      if (!user) {
        const error = new Error("User not found");
        error.status = 401;
        throw error;
      }
  
      // Generate new access token
      const accessToken = generateAccessToken(user);
  
      logger.info("Access token generated successfully");
      res.success(201, "New Access Token generated", {accessToken});
  
    } catch (err) {
      logger.error("Access token generation failed:", err.message);

      // remove refresh token in cookie if available and old one is gone 
      if (req.cookies.refreshToken) {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,       // true in production with HTTPS
          sameSite: "Strict", // or "Lax" depending on your frontend
        });
        logger.info("Refresh token cookie cleared due to error.");
      }


      const error = new Error(err.message || "Invalid token");
      error.status = err.status || 401;
       next(error);
    }
  };
  