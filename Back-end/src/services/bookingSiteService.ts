import {
  getBookingSiteBookingModel,
  type BookingSiteBooking,
} from "../models/BookingSiteBooking.js";

export interface BookingSiteBookingQuery {
  status?: "active" | "cancelled";
  rangeStart?: string;
  rangeEnd?: string;
  limit?: number;
}

export const getBookingSiteBookingsService = async (
  query: BookingSiteBookingQuery
): Promise<BookingSiteBooking[]> => {
  const BookingSiteBookingModel = getBookingSiteBookingModel();
  const mongoQuery: Record<string, unknown> = {};

  if (query.status) {
    mongoQuery.status = query.status;
  }

  if (query.rangeStart || query.rangeEnd) {
    const dateQuery: Record<string, string> = {};
    if (query.rangeStart) dateQuery.$gte = query.rangeStart;
    if (query.rangeEnd) dateQuery.$lte = query.rangeEnd;
    mongoQuery.date = dateQuery;
  }

  const limit = Math.min(Math.max(Number(query.limit || 1000), 1), 3000);

  return BookingSiteBookingModel.find(mongoQuery)
    .sort({ date: 1, time: 1, createdAt: 1 })
    .limit(limit)
    .lean<BookingSiteBooking[]>()
    .exec();
};
