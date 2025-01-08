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
  getById as getByIdService,
  getAllWarehouse as getAllWarehouseService,
  createWarehouse,
  createCanvas as createCanvasService,
  getByCanvas as getCanvas,
  deleteCanvas
  , updateCanvas
} from "../modules/servises.js";
import { handleResponse } from '../utils/responseHandler.js';
import WareHouse from "../modules/warehouseModul.js";
import Book from "../modules/modul.js";
import Canvas from "../modules/canvasModul.js";




export const getAllBooks = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Current page
  const limit = parseInt(req.query.limit) || 50; // Number of items per page
  const offset = (page - 1) * limit; // Calculate offset

  try {
    const totalBooks = await Book.countDocuments(); // Get total number of books
    const books = await Book.find()
      .sort({ _id: -1 }) // Sort by _id in ascending order (chronologically by creation)
      .skip(offset) // Skip the offset
      .limit(limit)
    res.json({
      success: true,
      message: "Successfully fetched books",
      data: books,
      total: totalBooks,
      page,
      totalPages: Math.ceil(totalBooks / limit), // Calculate total pages
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
      .skip(offset)      // Skip the offset
      .limit(limit);
    res.json({
      success: true,
      message: "Successfully fetched Canvases",
      data: canvases,
      total: totalCanvas,
      page,
      totalPages: Math.ceil(totalCanvas / limit),
    })
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
    handleResponse(res, warehouseItems, "Successfully fetched all warehouse items", "Failed to fetch warehouse items");
  } catch (error) {
    console.error("Error fetching warehouse items:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};



export const getBookById = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await getByIdService(id);
    if (book) {
      res.status(200).json({ success: true, data: book, message: "Book retrieved successfully." });
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
    const { day, bookedTime, frame, paper, frameAndPaper, pictures, packageName } = req.body;

    const existingBooking = await Book.findOne({ day, bookedTime, packageName });
    console.log(existingBooking);

    if (existingBooking) {
      return res.status(400).json({ success: false, message: "Booking already exists for this day and time and also package." });
    }

    const processDeductions = async (items, type) => {
      for (const item of items) {
        await deductQuantity(type, item.size, item.count);
      }
    };

    if (pictures && pictures.length > 0) {
      await processDeductions(pictures, "paper");
    }


    if (paper && paper.length > 0) {
      await processDeductions(paper, "paper");
    }


    if (frame && frame.length > 0) {
      await processDeductions(frame, "frame");
    }


    if (frameAndPaper && frameAndPaper.length > 0) {
      for (const item of frameAndPaper) {
        console.log(item)
        await deductQuantity("frame", item.size, item.count || 0);
        await deductQuantity("paper", item.size, item.count || 0);
      }
    }

    const booking = await created(req);
    handleResponse(res, booking, "Booking created successfully", "Failed to create booking", 201);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ success: false, message: error.message });
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

    const existingItem = await WareHouse.findOne({ type, size });

    if (existingItem) {
      // Update quantity if the item exists
      existingItem.quantity += quantity;
      await existingItem.save();
      handleResponse(res, existingItem, "Quantity updated successfully", "Failed to update quantity");
    } else {
      // Create new item only if it is not "paper" or "frame"
      if (type === "paper" || type === "frame") {
        return res.status(400).json({ success: false, message: "Cannot create item of type paper or frame." });
      }

      const newWarehouseItem = await createWarehouse(req); // Ensure this function is defined
      handleResponse(res, newWarehouseItem, "Item created successfully", "Failed to create item", 201);
    }
  } catch (error) {
    console.error("Error creating warehouse item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updateBook = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBook = await update(id, req);
    handleResponse(res, updatedBook, "Book updated successfully", "Failed to update book");
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const updatedCanvas = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedCanvas = await updateCanvas(id, req);
    handleResponse(res, updatedCanvas, "Book updated successfully", "Failed to update book");
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await deleted(id);
    handleResponse(res, book, "Book deleted successfully", "Failed to delete book");
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deletedCanvas = async (req, res) => {
  try {
    const { id } = req.params;
    const canvas = await deleteCanvas(id);
    handleResponse(res, canvas, "Book deleted successfully", "Failed to delete book");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const fetchBooksByCanvas = async (req, res) => {
//   const page = parseInt(req.query.page) || 1; // Current page
//   const limit = parseInt(req.query.limit) || 20; // Number of items per page
//   const offset = (page - 1) * limit; // Calculate offset

//   try {
//     const totalCanvas = await Canvas.countDocuments();
//     const canvases = await Canvas.find()
//       .sort({ _id: -1 }) // Sort by _id in descending order (latest first)
//       .skip(offset)      // Skip the offset
//       .limit(limit);
//     res.json({
//       success: true,
//       message: "Successfully fetched Canvases",
//       data: canvases,
//       total: totalCanvas,
//       page,
//       totalPages: Math.ceil(totalCanvas / limit),
//     })
//     // const canvas = await getCanvas();
//     // handleResponse(res, canvas, "Successfully fetched all canvases", "Failed to fetch canvases");
//   } catch (error) {
//     console.error("Error fetching books by canvas:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const getByPhoto = async (req, res) => {
  try {
    const photos = await getPhotos(req);
    handleResponse(res, photos, "Successfully fetched photos", "Failed to fetch photos");
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByCardType = async (req, res) => {
  try {
    const books = await getByCardTypes(req);
    handleResponse(res, books, "Successfully fetched books by card type", "Failed to fetch books by card type");
  } catch (error) {
    console.error("Error fetching books by card type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByCashType = async (req, res) => {
  try {
    const books = await getByCashTypes(req);
    handleResponse(res, books, "Successfully fetched books by cash type", "Failed to fetch books by cash type");
  } catch (error) {
    console.error("Error fetching books by cash type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getByAccountType = async (req, res) => {
  try {
    const books = await getByAccountTypes(req);
    handleResponse(res, books, "Successfully fetched books by account type", "Failed to fetch books by account type");
  } catch (error) {
    console.error("Error fetching books by account type:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
