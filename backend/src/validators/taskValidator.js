import mongoose from "mongoose";
import { body, check, param, query } from "express-validator";
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

// helper method for checking validJSON data
const isValidJson = (value, { path }) => {
  if (typeof value !== "string") {
      throw new Error(`Expected a string for "${path}", but got ${typeof value}`);
  }

  try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "object" || parsed === null) {
          throw new Error(`"${path}" should be a valid JSON object or array`);
      }
      return true;
  } catch (e) {
      throw new Error(`Invalid JSON in "${path}": ${e.message}`);
  }
};

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
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than or equal to 1")
        .toInt(),

    query("limit")
        .optional()
        .custom(value => value === "all" || (Number(value) > 0 && Number.isInteger(Number(value))))
        .withMessage("Limit must be a positive integer or the string all "),

    query("select")
        .optional()
        .isString()
        .withMessage("Select must be a string")
        .trim(),

    query("populate")
        .optional()
        .custom(isValidJson),

    query("filter")
        .optional()
        .custom(isValidJson),

    query("sort")
        .optional()
        .custom(isValidJson),
];

// for fetch particular task by id 
export const taskFetchByIdValidationRules = () => [

  param("id").notEmpty().withMessage("task id is required").bail().custom(async (value) => {
    if(!mongoose.Types.ObjectId.isValid(value))
    {
      throw new Error("Invalid task id")
    }
    return true
  }),
  
]
//  for all tasks for a user
export const taskFetchByUserIdValidationRules = () => [
  param("id").notEmpty().withMessage("user id is required").bail().custom(async (value) => {
    if(!mongoose.Types.ObjectId.isValid(value))
    {
      throw new Error("Invalid user id")
    }
    return true
  }),
  
]
// for overdue task status
export const taskOverdueStatusValidationRules = () => [
  param("id").notEmpty().withMessage("task id is required").bail()
  .custom(value=> {
    if(!mongoose.Types.ObjectId.isValid(value))
    {
      throw new Error("Invalid Task id")
    }
    return true
  },
  )]
//  for updating task by id
export const taskUpdateValidationRules = () => [
   // Validate task ID from params
   param("id")
   .notEmpty().withMessage("Task id is required")
   .bail()
   .custom((value) => {
     if (!mongoose.Types.ObjectId.isValid(value)) {
       throw new Error("Invalid task id");
     }
     return true;
   }),

 // Validate title (optional in update, but if provided, should not be empty)
 body("title")
   .optional()
   .notEmpty().withMessage("Title cannot be empty"),

 // Validate description
 body("description")
   .optional()
   .notEmpty().withMessage("Description cannot be empty"),

 // Validate dueDate
 body("dueDate")
   .optional()
   .isISO8601().withMessage("Due date must be a valid date")
   .bail()
   .custom((value) => {
     if (new Date(value) < new Date()) {
       throw new Error("Due date must be a future date");
     }
     return true;
   }),

 // Validate status
 body("status")
   .optional()
   .isIn(["pending", "completed"]).withMessage("Status must be either pending or completed"),

 // Validate assignedTo
 body("assignedTo")
   .optional()
   .custom((value) => {
     if (!mongoose.Types.ObjectId.isValid(value)) {
       throw new Error("Invalid assignedTo user ID");
     }
     return true;
   }),
]
// for deleting task by id 
export const taskDeleteValidationRules = () => [
  // Validate task ID from params
  param("id")
  .notEmpty().withMessage("Task id is required")
  .bail()
  .custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid task id");
    }
    return true;
  }),
]