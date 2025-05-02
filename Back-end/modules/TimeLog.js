import e from "express";
import { Schema, model } from "mongoose";

const timeLogSchema = new Schema(
  {
    employee: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    clockIn: { type: String, required: true }, // HH:mm
    clockOut: { type: String, required: true }, // HH:mm
  },
  { timestamps: true }
);

const TimeLog = model("TimeLog", timeLogSchema);
export default TimeLog;
