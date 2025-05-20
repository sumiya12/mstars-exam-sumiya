import express from "express";
import {
  getCalendlyUser,
  getScheduledEvents,
  createCalendlyEvents,
  getPaidStatus,
} from "../calendly/calendly.controller.js";

const router = express.Router();

router.get("/calendly", getCalendlyUser);
router.get("/events", getScheduledEvents);
router.post("/payment-status", createCalendlyEvents);
router.get("/paid-invitees", getPaidStatus);

export default router;
