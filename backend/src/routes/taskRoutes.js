import express from "express";
import { createTask, deleteTaskById, getMonthlyTaskCompletedTrend, getOverdueStatus, getOverdueTaskByUser, getTaskById, getTasks, getTasksByUser, getTasksCountByUser, getTasksDueByMonth, getTaskSummary, getTopEmployee, updateTaskById } from "../controllers/taskController.js";
import { headerAuthentication } from "../middilewares/headerAuthHandler.js";
import { taskCreationValidationRules, taskDeleteValidationRules, taskFetchAllValidationRules, taskFetchByIdValidationRules, taskFetchByUserIdValidationRules, taskOverdueStatusValidationRules, taskUpdateValidationRules } from "../validators/taskValidator.js";
import { validate } from "../middilewares/validateHandler.js";

const taskRoute=express.Router()

taskRoute.post("/create-task",headerAuthentication,taskCreationValidationRules(),validate,createTask)

taskRoute.get("/tasks",headerAuthentication,taskFetchAllValidationRules(),validate,getTasks)
taskRoute.get("/task-by-id/:id",headerAuthentication,taskFetchByIdValidationRules(),validate,getTaskById)
taskRoute.get("/tasks-by-user/:id",headerAuthentication,[...taskFetchByIdValidationRules(),taskFetchByUserIdValidationRules()],validate,getTasksByUser)
taskRoute.get("/:id/overdue-task-status",headerAuthentication,taskOverdueStatusValidationRules(),validate,getOverdueStatus)
taskRoute.get("/task-summary",headerAuthentication,getTaskSummary)
taskRoute.get("/task-count-by-user/:id",headerAuthentication,getTasksCountByUser)
taskRoute.get("/task-due-by-month",headerAuthentication,getTasksDueByMonth)
taskRoute.get("/top-users-task",headerAuthentication,getTopEmployee)
taskRoute.get("/overdue-task-by-user",headerAuthentication,getOverdueTaskByUser)
taskRoute.get("/monthly-task-completion-trend",headerAuthentication,getMonthlyTaskCompletedTrend)


taskRoute.patch("/update-task-by-id/:id",headerAuthentication,taskUpdateValidationRules(),validate,updateTaskById)
taskRoute.delete("/delete-task-by-id/:id",headerAuthentication,taskDeleteValidationRules(),validate,deleteTaskById)

export default taskRoute