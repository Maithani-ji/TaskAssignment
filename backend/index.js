import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import connectDB from "./src/config/db.js";


 dotenv.config(); 

const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));  // Optional: for form data
app.use(cors())
//  CORS EXTRAS...

// const corsOptions = {
//     origin: "http://example.com",  // Allow only requests from this origin
//     methods: ["GET", "POST"],     // Allow only GET and POST methods
//   };
//   app.use(cors(corsOptions));

app.use(morgan("dev"))
// Connect to MongoDB
await connectDB();

//  Auth Routes
import authRoute from "./src/routes/authRoutes.js" 
app.use("/api/auth",authRoute)

const PORT_URL = process?.env?.PORT
app.listen(PORT_URL,"0.0.0.0", () => {
    console.log("Server running on port",PORT_URL);
})

