import express from "express";
import { createTask, getTasks } from "../controllers/taskController.js";
import { headerAuthentication } from "../middilewares/headerAuthHandler.js";
import { taskCreationValidationRules, taskFetchAllValidationRules } from "../validators/taskValidator.js";
import { validate } from "../middilewares/validateHandler.js";

const taskRoute=express.Router()

taskRoute.post("/create-task",headerAuthentication,taskCreationValidationRules(),validate,createTask)
taskRoute.get("/tasks",headerAuthentication,taskFetchAllValidationRules(),validate,getTasks)
export default taskRoute