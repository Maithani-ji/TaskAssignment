import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';
import dotenv from 'dotenv'

dotenv.config()

const app = express();
app.use(cors())
app.use(express.json())
// Connect to MongoDB
connectDB();

const PORT_URL = process?.env?.PORT
app.listen(PORT_URL,"0.0.0.0", () => {
    console.log("Server running on port",PORT_URL);
})

