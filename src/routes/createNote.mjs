import express from "express";
import Note from "../schemas/Note.mjs";
import { NoteValidationSchema } from "../utils/NoteValidationSchema.mjs";
import { checkSchema, validationResult, matchedData } from "express-validator";

const router = express.Router();

// Route: Create a new note
router.post("/api/create-note",
    checkSchema(NoteValidationSchema), // Validate request body using schema
    async (req, res) => {
        try {
            // Check for validation errors
            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                console.log("Validation Errors:", validationErrors.array());

                // Send the first validation error as response
                return res.status(200).json({
                    message: validationErrors.array()[0].msg,
                    isSaved: false
                });
            }

            // Extract only validated data from the request
            const validatedData = matchedData(req);

            // Attach user's username to the note if needed
            // const username = req.user.username;
            // validatedData.username = username;

            // Create and save the new note
            const noteToSave = new Note(validatedData);
            const savedNote = await noteToSave.save();

            // Respond with success
            return res.status(201).json({
                message: "Note created successfully",
                isSaved: true,
                note: savedNote
            });

        } catch (error) {
            console.error("Error while creating note:", error.message);

            // Respond with error
            return res.status(500).json({
                message: "Note creation failed",
                isSaved: false,
                error: error.message
            });
        }
    }
);

export default router;
