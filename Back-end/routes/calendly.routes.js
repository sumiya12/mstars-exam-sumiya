// routes/calendlyRoutes.js
import express from "express";
import {
  getCalendlyUser,
  getScheduledEvents,
  getInviteesForAllEvents,
  getEventsByDate,
} from "../calendly/calendly.controller.js"; // Adjust the import path as necessary

const router = express.Router();

const start = "2025-05-05T00:00:00Z";
const end = "2025-05-08T00:00:00Z";
router.get("/calendly", getCalendlyUser); // This hits your /me endpoint
router.get("/events", getScheduledEvents); // 👈 Add this line
router.get("/invitees", getInviteesForAllEvents);
router.get("/invitees/latest", getEventsByDate(start, end));
router.get("/calendly/invitees", async (req, res) => {
  try {
    // Replace with real API call to Calendly
    const response = await fetch("https://calendly.com/api/v1/invitees"); // Make sure the API is correct
    const invitees = await response.json();
    res.json(invitees);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invitees" });
  }
});

export default router;
