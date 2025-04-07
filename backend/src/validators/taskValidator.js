import mongoose from "mongoose";
import { body, check } from "express-validator";
import User from "../models/User.js";

// for create task
export const taskCreationValidationRules=()=>[
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("dueDate").notEmpty().withMessage("Due Date is required").bail().isISO8601().withMessage("Due date must be a valid date").custom(async(value)=>{
        const dueDate=new Date(value)
        if(dueDate < new Date())
        {
            throw new Error("Due date must be a future date")
        }
        return true;
    }),
    body("assignedTo")
    .notEmpty().withMessage("User ID is required")
    .bail()
    .custom(async(value) => {
      //  if id is valid
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error("Invalid user ID");
      }
      // if id is valid but the assigned user is valid or not 
      const user=await User.findById(value)
      if(!user)
      {
          throw new Error("Invalid user for task assignment")
        
      }
      return true;
    }), 
]

// for fetch all tasks
export const taskFetchAllValidationRules = () => [
  check("dummy") // <-- Dummy field name
    .custom(async (_, { req }) => {
      const { decoded } = req;

      if (!decoded) {
        throw new Error("Access denied: token payload missing");
      }

      const { userId } = decoded;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user id");
      }

      const user = await User.findById(userId).lean();
      if (!user) {
        throw new Error("User does not exist");
      }

      // Optional: role check
      // if (user.role !== "manager") {
      //   throw new Error(`Access Denied to ${user.role}`);
      // }

      return true;
    }),
];