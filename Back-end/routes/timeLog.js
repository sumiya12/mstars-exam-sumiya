import express from "express";
import {
  getTimeLogsByDate,
  createTimeLog,
  deleteTimeLog,
  getallTimeLogs,
} from "../controllers/timeLogController.js"; // Adjust the import path as necessary
const router = express.Router();

router.get("/get", getTimeLogsByDate); // /api/timelogs?date=YYYY-MM-DD
router.get("/getall", getallTimeLogs); // /api/timelogs?date=YYYY-MM-DD
router.post("/create", createTimeLog);
router.delete("/delete/:id", deleteTimeLog); // Assuming you have a delete function in your controller

export default router;
