import type { Response } from "express";
import type { AppRequest } from "../types/http.js";
import { getBookingSiteBookingsService } from "../services/bookingSiteService.js";

const parseStatus = (value: unknown): "active" | "cancelled" | undefined => {
  if (value === "active" || value === "cancelled") return value;
  return undefined;
};

const parseString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const parseLimit = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const getBookingSiteBookings = async (req: AppRequest, res: Response) => {
  try {
    const bookings = await getBookingSiteBookingsService({
      status: parseStatus(req.query.status),
      rangeStart: parseString(req.query.rangeStart),
      rangeEnd: parseString(req.query.rangeEnd),
      limit: parseLimit(req.query.limit),
    });

    res.json({
      success: true,
      bookings,
      total: bookings.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Booking site fetch error:", message);
    res.status(500).json({ success: false, message: "Failed to fetch booking site data" });
  }
};
