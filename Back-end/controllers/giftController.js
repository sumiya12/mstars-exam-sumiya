import {
    created, getAllGift, update,deleted
} from "../services/giftService.js";
import { handleResponse } from '../utils/responseHandler.js';



export const getAllGiftCard = async (req, res) => {
    try {
        const giftCard = await getAllGift(req);
        handleResponse(res, giftCard, "Successfully fetched all books", "Failed to fetch books");
    } catch (error) {
        console.error("Error fetching all books:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createNewGiftCard = async (req, res) => {
    try {
        const giftCard = await created(req);
        res.status(200).json({
            success: true,
            data: giftCard,
            message: "Canvas created successfully.",
        });
    } catch (error) {
        console.error("Error creating canvas:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGiftCard = async (req, res) => {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: "No data provided to update." });
    }

    try {
        const updatedGift = await update(id, req.body);
        handleResponse(res, updatedGift, "Gift card updated successfully", "Failed to update gift card");
    } catch (error) {
        console.error("Error updating gift card:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


export const deleteGiftCard = async (req, res) => {
    try {
      const { id } = req.params;
      const giftCard = await deleted(id);
      handleResponse(res, giftCard, "Book deleted successfully", "Failed to delete book");
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
