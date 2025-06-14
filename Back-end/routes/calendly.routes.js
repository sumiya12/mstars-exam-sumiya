import express from "express";
import {
  getCalendlyUser,
  getAllScheduledEvents,
  createCalendlyEvents,
  getPaidStatus,
  checkPhoneDuplicate,
  deleteCalendlyEvent,
} from "../calendly/calendly.controller.js";

const router = express.Router();

router.get("/calendly", getCalendlyUser);
router.get("/events", getAllScheduledEvents);
router.post("/payment-status", createCalendlyEvents);
router.get("/paid-invitees", getPaidStatus);
router.get("/check-phone", checkPhoneDuplicate);
router.delete("/delete/:id", deleteCalendlyEvent);

export default router;
