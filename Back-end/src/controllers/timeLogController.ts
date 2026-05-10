import TimeLog from "../models/TimeLog.js";
import dayjs from "dayjs";
import type { Response } from "express";
import type { AppRequest } from "../types/http.js";

export const getTimeLogsByDate = async (req: AppRequest, res: Response) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    const logs = await TimeLog.find({ date }); // dynamic value
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getallTimeLogs = async (_req: AppRequest, res: Response) => {
  try {
    const logs = await TimeLog.find().sort({ createdAt: -1 }); // latest first
    res.json(logs);
  } catch (error) {
    console.error("Failed to fetch logs:", error);
    res.status(500).json({ message: "Server error" });
  }
}

export const createTimeLog = async (req: AppRequest, res: Response) => {
  const { employee, date, clockIn, clockOut, description } = req.body;

  const log = new TimeLog({
    description, // 👈 added description
    employee,
    date: dayjs().format("YYYY-MM-DD"), // 👈 ensures it's a clean string
    clockIn,
    clockOut,
  });
  await log.save();
  res.status(201).json(log);
};

export const deleteTimeLog = async (
  req: AppRequest<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    await TimeLog.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Failed to delete" });
  }
};
