import express from "express";
import Streak from "../schemas/Streak.mjs";
import Task from "../schemas/Task.mjs";
import { startOfDay, subDays } from "date-fns";

const router = express.Router();

// Route: GET /api/streak
// Description: Calculates current and longest streak of daily tasks completed
router.get('/api/streak', async (req, res) => {
    try {
        const username = req.user.username; // Assuming authentication middleware sets req.user
        const today = startOfDay(new Date()); // Normalize today's date to start of the day

        // Step 1: Fetch all 'daily' tasks for the user
        const allDailyTasks = await Task.find({
            username,
            type: 'daily',
        }).sort({ dueDate: 1 }); // Sort tasks by dueDate ascending

        // Step 2: Group tasks by date (normalized to start of the day)
        const tasksByDate = allDailyTasks.reduce((grouped, task) => {
            const taskDate = startOfDay(new Date(task.dueDate)).toISOString();
            if (!grouped[taskDate]) {
                grouped[taskDate] = [];
            }
            grouped[taskDate].push(task);
            return grouped;
        }, {});

        // Step 3: Calculate current streak (consecutive days from today with tasks)
        let currentStreak = 0;
        let checkDate = today;

        while (true) {
            const dateKey = checkDate.toISOString();
            if (tasksByDate[dateKey]) {
                currentStreak++;
                checkDate = subDays(checkDate, 1); // Move to previous day
            } else {
                break;
            }
        }

        // Step 4: Calculate longest streak across all dates
        let longestStreak = 0;
        let tempStreak = 0;

        const sortedTaskDates = Object.keys(tasksByDate)
            .map(date => new Date(date))
            .sort((a, b) => a - b); // Ascending order

        for (let i = 0; i < sortedTaskDates.length; i++) {
            if (i === 0) {
                tempStreak = 1;
            } else {
                const dayGap = (sortedTaskDates[i] - sortedTaskDates[i - 1]) / (1000 * 60 * 60 * 24);
                if (dayGap === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
        }

        // Final check for longest streak
        longestStreak = Math.max(longestStreak, tempStreak);

        // Step 5: Save/update streak record in DB
        let streakDoc = await Streak.findOne({ username });

        if (!streakDoc) {
            // Create new streak record
            streakDoc = new Streak({
                username,
                streak: currentStreak,
                longestStreak
            });
        } else {
            // Update existing streak
            streakDoc.streak = currentStreak;
            streakDoc.longestStreak = Math.max(longestStreak, streakDoc.longestStreak || 0);
        }

        await streakDoc.save();

        // Step 6: Respond with streak data
        return res.status(200).json({
            streak: currentStreak,
            longestStreak: streakDoc.longestStreak,
            message: "Streak calculated successfully",
            success: true
        });

    } catch (error) {
        console.error("Error calculating streak:", error.message);
        return res.status(500).json({
            message: error.message,
            success: false
        });
    }
});

export default router;
