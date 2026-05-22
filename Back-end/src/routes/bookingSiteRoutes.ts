import express from "express";
import { getBookingSiteBookings } from "../controllers/bookingSiteController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/bookings", authMiddleware, getBookingSiteBookings);

export default router;
