import {
  created,
  getAllBooks as get,
  update,
  deleted,
  getAllWarehouse as getAllWarehouseService,
  createWarehouse,
  updateCanvasCheck,
} from "../services/studioService.js";
import { handleResponse } from "../utils/responseHandler.js";
import WareHouse from "../models/WarehouseItem.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import {
  buildCreatedByMatchExpression,
  createdByPopulateOptions,
} from "../utils/createdBy.js";

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

export const getAllBookForChart = async (req, res) => {
  try {
    const books = await Book.find()
      .populate(createdByPopulateOptions)
      .lean();
    res.json({
      success: true,
      message: "Successfully fetched books",
      data: books,
    });
  } catch (error) {
    console.error("Error fetching all books:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;

  try {
    const query: Record<string, any> = {};

    if (req.query.year) {
      query.year = String(req.query.year);
    }

    if (req.query.day) {
      query.day = req.query.day;
    }

    if (req.query.paymentType) {
      const paymentType = String(req.query.paymentType);
      const paymentBreakdownKey = paymentType.toLowerCase();
      query.$or = [
        { paymenType: paymentType },
        { [`paymentBreakdown.${paymentBreakdownKey}`]: { $gt: 0 } },
      ];
    }

    const createdByMatchExpression = await buildCreatedByMatchExpression(
      req.query.createdBy
    );

    if (createdByMatchExpression) {
      query.$expr = createdByMatchExpression;
    }

    if (req.query.description) {
      query.description = {
        $regex: String(req.query.description),
        $options: "i",
      };
    }

    if (req.query.packageName) {
      const packageNames = String(req.query.packageName)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (packageNames.length > 0) {
        query.packageName = { $in: packageNames };
      }
    }

    if (req.query.canvasOnly === "true") {
      query["canvas.0"] = { $exists: true };
    }

    const totalBooks = await Book.countDocuments(query);

    const books = await Book.find(query)
      .populate(createdByPopulateOptions)
      .lean()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    res.json({
      success: true,
      message: "Successfully fetched books",
      data: books,
      total: totalBooks,
      page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error("Error fetching all books:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getAllWarehouses = async (req, res) => {
  try {
    const warehouseItems = await getAllWarehouseService(req);
    handleResponse(
      res,
      warehouseItems,
      "Successfully fetched all warehouse items",
      "Failed to fetch warehouse items"
    );
  } catch (error) {
    console.error("Error fetching warehouse items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deductQuantity = async (type, size, count) => {
  try {
    // Find the item in the warehouse
    const foundItem = await WareHouse.findOne({ type, size });

    // Check if the item exists
    if (!foundItem) {
      throw new Error(`No ${type} found for size: ${size}`);
    }

    // Check if there is sufficient quantity
    if (foundItem.quantity < count) {
      throw new Error(`Insufficient quantity for ${type} size: ${size}`);
    }

    // Deduct the quantity and save the updated item
    foundItem.quantity -= count;
    await foundItem.save();
  } catch (error) {
    // Log the error for debugging
    console.error("Error deducting quantity:", error);
    throw error; // Re-throw the error to handle it upstream
  }
};

export const createBook = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not found in request",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

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
      frame = [],
      paper = [],
      frameAndPaper = [],
      pictures = [],
      canvas = [],
      paymenType,
      paymentBreakdown,
      description,
    } = req.body;

    const normalizedPaymentBreakdown = normalizePaymentBreakdown(paymentBreakdown);
    const resolvedPaymentType = getPrimaryPaymentType(
      normalizedPaymentBreakdown,
      paymenType
    );

    const existingBooking = await Book.findOne({
      year,
      day,
      bookedTime,
      packageName,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Booking already exists for this day, time and package.",
      });
    }

    const processDeductions = async (items, type) => {
      for (const item of items || []) {
        if (item?.size && Number(item?.count) > 0) {
          await deductQuantity(type, item.size, Number(item.count));
        }
      }
    };

    await processDeductions(pictures, "paper");
    await processDeductions(paper, "paper");
    await processDeductions(frame, "frame");

    for (const item of frameAndPaper || []) {
      if (item?.size && Number(item?.count) > 0) {
        await deductQuantity("frame", item.size, Number(item.count));
        await deductQuantity("paper", item.size, Number(item.count));
      }
    }

    const bookingData = {
      year,
      day,
      bookedTime,
      packageName,
      prePay: Number(prePay || 0),
      postPay,
      addPayment,
      minusPayment,
      giftPhoto,
      frame,
      paper,
      frameAndPaper,
      pictures,
      canvas,
      paymenType: resolvedPaymentType,
      paymentBreakdown: normalizedPaymentBreakdown,
      description,
      createdBy: user._id,
      createdAt: new Date(),
    };

    const booking = await Book.create(bookingData);

    return handleResponse(
      res,
      booking,
      "Booking created successfully",
      "Failed to create booking",
      201
    );
  } catch (error) {
    console.error("Error creating book:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createWarehouseItem = async (req, res) => {
  try {
    const { type, size, quantity, price } = req.body;

    // Validate required fields
    if (!type || type.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Type is required." });
    }

    if (!size || size.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Size is required." });
    }

    if (quantity === undefined || quantity === null || isNaN(quantity)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid quantity is required." });
    }

    const parsedQuantity = Number(quantity);
    if (parsedQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Quantity must be greater than 0." });
    }

    if (!["paper", "frame"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either paper or frame.",
      });
    }

    const warehouseItem = await WareHouse.findOneAndUpdate(
      { type, size },
      {
        $inc: { quantity: parsedQuantity },
        ...(price !== undefined ? { $set: { price: Number(price || 0) } } : {}),
      },
      { new: true, upsert: true, runValidators: true }
    );

    return handleResponse(
      res,
      warehouseItem,
      "Quantity updated successfully",
      "Failed to update quantity"
    );
  } catch (error) {
    console.error("Error creating warehouse item:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error: " + error.message });
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBook = await update(id, req);
    handleResponse(
      res,
      updatedBook,
      "Book updated successfully",
      "Failed to update book"
    );
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updateIsCanvasCheck = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCanvas = await updateCanvasCheck(id, req);
    handleResponse(
      res,
      updatedCanvas,
      "Book updated successfully",
      "Failed to update book"
    );
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await deleted(id);
    handleResponse(
      res,
      book,
      "Book deleted successfully",
      "Failed to delete book"
    );
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
