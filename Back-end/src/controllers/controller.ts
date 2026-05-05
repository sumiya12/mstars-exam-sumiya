import {
  created,
  getAllBooks as get,
  update,
  getByCanvas as getBooksByCanvas,
  getByPhoto as getPhotos,
  getByCardType as getByCardTypes,
  getByCashType as getByCashTypes,
  getByAccountType as getByAccountTypes,
  deleted,
  getAllWarehouse as getAllWarehouseService,
  createWarehouse,
  createCanvas as createCanvasService,
  getByCanvas as getCanvas,
  deleteCanvas,
  updateCanvas,
  updateCanvasCheck,
} from "../modules/servises.js";
import { handleResponse } from "../utils/responseHandler.js";
import WareHouse from "../modules/warehouseModul.js";
import Book from "../modules/modul.js";
import Canvas from "../modules/canvasModul.js";
import User from "../modules/userModel.js";
import {
  buildCreatedByMatchExpression,
  createdByPopulateOptions,
} from "../utils/createdBy.js";
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

    if (req.query.day) {
      query.day = req.query.day;
    }

    if (req.query.paymentType) {
      query.paymenType = req.query.paymentType;
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
export const getAllCanvas = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page
  const limit = parseInt(req.query.limit) || 50; // Number of items per page
  const offset = (page - 1) * limit; // Calculate offset

  try {
    const totalCanvas = await Canvas.countDocuments();

    const canvases = await Canvas.find()
      .sort({ _id: -1 }) // Sort by _id in descending order (latest first)
      .skip(offset) // Skip the offset
      .limit(limit);
    res.json({
      success: true,
      message: "Successfully fetched Canvases",
      data: canvases,
      total: totalCanvas,
      page,
      totalPages: Math.ceil(totalCanvas / limit),
    });
    // const canvas = await getCanvas();
    // handleResponse(res, canvas, "Successfully fetched all canvases", "Failed to fetch canvases");
  } catch (error) {
    console.error("Error fetching all canvases:", error);
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

export const getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id)
      .populate(createdByPopulateOptions)
      .lean();
    if (book) {
      res.status(200).json({
        success: true,
        data: book,
        message: "Book retrieved successfully.",
      });
    } else {
      res.status(404).json({ success: false, message: "Book not found." });
    }
  } catch (error) {
    console.error("Error fetching book by ID:", error);
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
      description,
    } = req.body;

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
      prePay,
      postPay,
      addPayment,
      minusPayment,
      giftPhoto,
      frame,
      paper,
      frameAndPaper,
      pictures,
      canvas,
      paymenType,
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

export const createNewCanvas = async (req, res) => {
  try {
    const canvas = await createCanvasService(req);
    res.status(200).json({
      success: true,
      data: canvas,
      message: "Canvas created successfully.",
    });
  } catch (error) {
    console.error("Error creating canvas:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createWarehouseItem = async (req, res) => {
  try {
    const { type, size, quantity } = req.body;

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

    // Check for existing item
    const existingItem = await WareHouse.findOne({ type, size });

    if (existingItem) {
      existingItem.quantity += parsedQuantity;
      await existingItem.save();

      return handleResponse(
        res,
        existingItem,
        "Quantity updated successfully",
        "Failed to update quantity"
      );
    }

    // Restrict creation of "paper" or "frame" items
    if (type === "paper" || type === "frame") {
      return res.status(400).json({
        success: false,
        message: "Cannot create item of type 'paper' or 'frame'.",
      });
    }

    const newWarehouseItem = await createWarehouse(req); // Assumes this handles validation and creation
    return handleResponse(
      res,
      newWarehouseItem,
      "Item created successfully",
      "Failed to create item",
      201
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

export const updatedCanvas = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCanvas = await updateCanvas(id, req);
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
export const deletedCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    const canvas = await deleteCanvas(id);
    handleResponse(
      res,
      canvas,
      "Book deleted successfully",
      "Failed to delete book"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByPhoto = async (req, res) => {
  try {
    const photos = await getPhotos(req);
    handleResponse(
      res,
      photos,
      "Successfully fetched photos",
      "Failed to fetch photos"
    );
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByCardType = async (req, res) => {
  try {
    const books = await getByCardTypes(req);
    handleResponse(
      res,
      books,
      "Successfully fetched books by card type",
      "Failed to fetch books by card type"
    );
  } catch (error) {
    console.error("Error fetching books by card type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByCashType = async (req, res) => {
  try {
    const books = await getByCashTypes(req);
    handleResponse(
      res,
      books,
      "Successfully fetched books by cash type",
      "Failed to fetch books by cash type"
    );
  } catch (error) {
    console.error("Error fetching books by cash type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByAccountType = async (req, res) => {
  try {
    const books = await getByAccountTypes(req);
    handleResponse(
      res,
      books,
      "Successfully fetched books by account type",
      "Failed to fetch books by account type"
    );
  } catch (error) {
    console.error("Error fetching books by account type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
