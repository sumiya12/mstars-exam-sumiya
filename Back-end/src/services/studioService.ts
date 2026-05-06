import Book from "../models/Book.js";
import WareHouse from "../models/WarehouseItem.js";
import { Types } from "mongoose";
import Calendly from "../models/CalendlyEvent.js";

const normalizePaymentBreakdown = (paymentBreakdown?: any) => ({
  cash: Number(paymentBreakdown?.cash || 0),
  card: Number(paymentBreakdown?.card || 0),
  account: Number(paymentBreakdown?.account || 0),
});

const getPrimaryPaymentType = (paymentBreakdown?: any, fallback = "") => {
  const normalized = normalizePaymentBreakdown(paymentBreakdown);
  const activeTypes = Object.entries(normalized).filter(
    ([, value]) => Number(value) > 0
  );

  if (activeTypes.length > 1) return "Mixed";
  if (activeTypes.length === 1) {
    const [type] = activeTypes[0];
    const labels: Record<string, string> = {
      cash: "Cash",
      card: "Card",
      account: "Account",
    };
    return labels[type] || fallback;
  }

  return fallback;
};

// Helper function for standard error handling
const handleDatabaseOperation = async (operation: () => any) => {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);
    throw new Error("Database operation failed");
  }
};

// Create operations
export const created = async (req) =>
  handleDatabaseOperation(() => new Book(req.body).save());
export const createCalendlyEventsService = async (req) =>
  handleDatabaseOperation(() => new Calendly(req.body).save());
export const createWarehouse = async (req) =>
  handleDatabaseOperation(() => new WareHouse(req.body).save());

// Read operations
export const getAllBooks = async (_req?: unknown) =>
  handleDatabaseOperation(() => Book.find());
export const getAllPaidInvitees = async (_req?: unknown) =>
  handleDatabaseOperation(() => Calendly.find());
export const getAllWarehouse = async (_req?: unknown) =>
  handleDatabaseOperation(() => WareHouse.find());

// Update operations
export const update = async (id, req) => {
  const {
    year,
    day,
    bookedTime,
    packageName,
    prePay,
    postPay,
    addPayment,
    minusPayment,
    giftPhoto,
    pictures,
    paper,
    frame,
    frameAndPaper,
    canvas,
    paymenType,
    paymentBreakdown,
    description,
    pickedUpCanvas,
  } = req.body;

  try {
    const updateData: Record<string, any> = {};
    const normalizedPaymentBreakdown = normalizePaymentBreakdown(paymentBreakdown);
    const resolvedPaymentType = getPrimaryPaymentType(
      normalizedPaymentBreakdown,
      paymenType
    );

    const scalarFields: Record<string, any> = {
      year,
      day,
      bookedTime,
      packageName,
      prePay,
      postPay,
      addPayment,
      minusPayment,
      giftPhoto,
      paymenType: resolvedPaymentType,
      paymentBreakdown: paymentBreakdown ? normalizedPaymentBreakdown : undefined,
      description,
      pickedUpCanvas,
    };

    Object.entries(scalarFields).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (Array.isArray(pictures)) {
      updateData.pictures = pictures;
    }
    if (Array.isArray(paper)) {
      updateData.paper = paper;
    }
    if (Array.isArray(frame)) {
      updateData.frame = frame;
    }
    if (Array.isArray(frameAndPaper)) {
      updateData.frameAndPaper = frameAndPaper;
    }
    if (Array.isArray(canvas)) {
      updateData.canvas = canvas;
    }

    await Book.findByIdAndUpdate(id, { $set: updateData });
    return await Book.findById(id);
  } catch (error) {
    console.error("Error updating book:", error);
    throw new Error("Failed to update book");
  }
};

export const updateCanvasCheck = async (id, req) => {
  const { pickedUpCanvas } = req.body;

  try {
    // Create an update object
    const updateData: Record<string, any> = {
      pickedUpCanvas,
    };

    // Update the Canvas document
    await Book.findByIdAndUpdate(id, { $set: updateData });

    // Return the updated Canvas document
    return await Book.findById(id);
  } catch (error) {
    console.error("Error updating canvas:", error);
    throw new Error("Failed to update canvas");
  }
};

// Delete operations
export const deleted = async (id) => {
  if (Types.ObjectId.isValid(id)) {
    return await Book.findByIdAndDelete(id);
  }
  throw new Error("Invalid ID");
};

export const deleteCalendlyEventsService = async (id) => {  
  if (Types.ObjectId.isValid(id)) {
    return await Calendly.findByIdAndDelete(id);
  }
  throw new Error("Invalid ID");
};

