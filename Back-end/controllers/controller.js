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
} from "../modules/servises.js";
import { handleResponse } from '../utils/responseHandler.js';
import WareHouse from "../modules/warehouseModul.js";




export const getAllBooks = async (req, res) => {
  try {
    const books = await get(req);
    handleResponse(res, books, "Successfully fetched all books", "Failed to fetch books");
  } catch (error) {
    console.error("Error fetching all books:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllCanvas = async (req, res) => {
  try {
    const canvas = await getCanvas();
    handleResponse(res, canvas, "Successfully fetched all canvases", "Failed to fetch canvases");
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
  const foundItem = await WareHouse.findOne({ type, size });
  if (foundItem) {
    if (foundItem.quantity >= count) {
      foundItem.quantity -= count;
      await foundItem.save();
    } else {
      throw new Error(`Insufficient quantity for ${type} size: ${size}`);
    }
  } else {
    throw new Error(`No ${type} found for size: ${size}`);
  }
};

export const createBook = async (req, res) => {
  try {
    const { frame, paper, frameAndPaper, pictures } = req.body;


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
        await deductQuantity("frame", item.size, item.count.frame || 0);
        await deductQuantity("paper", item.size, item.count.paper || 0);
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

export const fetchBooksByCanvas = async (req, res) => {
  try {
    const books = await getBooksByCanvas(req);
    handleResponse(res, books, "Successfully fetched books by canvas", "Failed to fetch books by canvas");
  } catch (error) {
    console.error("Error fetching books by canvas:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


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
