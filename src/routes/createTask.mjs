import express from "express";
import Task from "../schemas/Task.mjs";
import { TaskValidationSchema } from "../utils/TaskValidationSchema.mjs";
import { checkSchema, validationResult, matchedData } from "express-validator";

const router = express.Router();

// Route: POST /api/create-task
// Description: Creates a new task
router.post("/api/create-task",
    checkSchema(TaskValidationSchema), // Step 1: Validate request body
    async (req, res) => {
        try {
            // Step 2: Check if validation failed
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log("Validation error:", errors.array());
                return res.status(400).json({
                    message: errors.array()[0].msg, // Send first validation error
                    isSaved: false
                });
            }

            // Step 3: Extract only validated data
            const validatedTaskData = matchedData(req);

            // Step 4: Create a new Task instance
            const newTask = new Task(validatedTaskData);

            // Step 5: Save the task to the database
            const savedTask = await newTask.save();

            // Step 6: Respond with success
            return res.status(201).json({
                message: "Task created successfully",
                isSaved: true,
                task: savedTask
            });

        } catch (error) {
            // Step 7: Handle unexpected server errors
            console.error("Error while creating task:", error.message);
            return res.status(500).json({
                message: "Task creation failed",
                isSaved: false,
                error: error.message
            });
        }
    }
);

export default router;
