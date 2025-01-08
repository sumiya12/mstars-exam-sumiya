import Book from "./modul.js";
import Canvas from "./canvasModul.js";
import WareHouse from "./warehouseModul.js";
import { Types } from "mongoose";


// Helper function for standard error handling
const handleDatabaseOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);
    throw new Error("Database operation failed");
  }
};

// Create operations
export const created = async (req) => handleDatabaseOperation(() => new Book(req.body).save());
export const createCanvas = async (req) => handleDatabaseOperation(() => new Canvas(req.body).save());
export const createWarehouse = async (req) => handleDatabaseOperation(() => new WareHouse(req.body).save());

// Read operations
export const getAllBooks = async () => handleDatabaseOperation(() => Book.find());
// export const getAllCanvas = async () => handleDatabaseOperation(() => Canvas.find());
export const getAllWarehouse = async () => handleDatabaseOperation(() => WareHouse.find());

export const getById = async (id) => {
  if (Types.ObjectId.isValid(id)) {
    return handleDatabaseOperation(() => Book.findById(id));
  }
  throw new Error("Invalid ID");
};

export const getByCanvas = async () => {
  return handleDatabaseOperation(async () => {
    const canvasBooks = await Canvas.find({ canvasPhoto: true });

    if (canvasBooks.length > 0) {
      return canvasBooks;
    } else {
      return { success: false, message: "No canvas books found", data: [] };
    }
  });
};

export const getByPhoto = async () => {
  return handleDatabaseOperation(async () => {
    const giftPhoto = await Book.find({ giftPhoto: true });
    return giftPhoto.length > 0
      ? giftPhoto
      : { success: false, message: "No gift photos found", data: [] };
  });
};

// Payment-related operations
const getByPaymentType = async (paymentType, req) => {
  const { day } = req.body; // Only use 'day' if relevant

  // Build the query object based on available fields
  const query = { paymenType: paymentType }; // Ensure to use the correct field name

  // Add optional filters based on existing fields
  if (day) {
    query.day = day; // This assumes 'day' is a valid field in your data
  }

  return handleDatabaseOperation(async () => {
    const books = await Book.find(query); // This will now only look for the existing fields
    const totalSum = books.reduce((acc, book) => acc + (book.postPay || 0), 0);

    return {
      success: true,
      totalSum,
      books,
    };
  });
};



export const getByCardType = (req) => getByPaymentType("Card", req);
export const getByCashType = (req) => getByPaymentType("Cash", req);
export const getByAccountType = (req) => getByPaymentType("Account", req);

// Update operations
export const update = async (id, req) => {
  const { packageName, prePay, postPay, giftPhoto, pictures, paper, frame, frameAndPaper, paymenType, description } = req.body

  try {
    const updateData = {
      packageName: packageName,
      prePay: prePay,
      postPay: postPay,
      giftPhoto: giftPhoto,
      paymenType: paymenType,
      description: description
    }
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

    await Book.findByIdAndUpdate(id, { $set: updateData });
    return await Book.findById(id);
  } catch (error) {
    console.error("Error updating book:", error);
    throw new Error("Failed to update book");
  }
};


export const updateCanvas = async (id, req) => {
  const { phone, mail, pictures, paymenType, description } = req.body;

  try {
    // Create an update object
    const updateData = {
      phone,
      mail,
      paymenType,
      description,
    };

    // Handle the pictures array
    if (Array.isArray(pictures)) {
      // If pictures array is provided, replace the existing array
      updateData.pictures = pictures;
    }

    // Update the Canvas document
    await Canvas.findByIdAndUpdate(id, { $set: updateData });

    // Return the updated Canvas document
    return await Canvas.findById(id);
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
export const deleteCanvas = async (id) => {
  if (Types.ObjectId.isValid(id)) {
    return await Canvas.findByIdAndDelete(id);

  }
  throw new Error("Invalid ID");
};
