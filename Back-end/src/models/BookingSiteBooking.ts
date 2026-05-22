import mongoose, { type Document, type Model } from "mongoose";

export interface BookingSiteBooking {
  id: string;
  eventId: string;
  eventTitle: string;
  status?: "active" | "cancelled";
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  note: string;
  createdAt: string;
  updatedAt?: string;
  cancelledAt?: string;
  cancelledReason?: string;
  rescheduledFrom?: {
    eventTitle: string;
    date: string;
    time: string;
  };
}

type BookingSiteBookingDocument = Document & BookingSiteBooking;

const bookingSiteBookingSchema = new mongoose.Schema<BookingSiteBookingDocument>(
  {
    id: { type: String, required: true },
    eventId: { type: String, required: true },
    eventTitle: { type: String, required: true },
    status: { type: String, default: "active" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    note: { type: String, default: "" },
    createdAt: { type: String, default: "" },
    updatedAt: { type: String, default: "" },
    cancelledAt: { type: String, default: "" },
    cancelledReason: { type: String, default: "" },
    rescheduledFrom: {
      eventTitle: { type: String, default: "" },
      date: { type: String, default: "" },
      time: { type: String, default: "" },
    },
  },
  {
    collection: "bookings",
    strict: false,
    versionKey: false,
  }
);

export const getBookingSiteBookingModel = (): Model<BookingSiteBookingDocument> => {
  const bookingDb = mongoose.connection.useDb("picshot_booking", { useCache: true });

  return (
    (bookingDb.models.Booking as Model<BookingSiteBookingDocument> | undefined) ||
    bookingDb.model<BookingSiteBookingDocument>("Booking", bookingSiteBookingSchema)
  );
};
