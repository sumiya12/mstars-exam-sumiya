import {
    created, getAllGift, update
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
    try {
        const updatedGift = await update(id, req);
        handleResponse(res, updatedGift, "Book updated successfully", "Failed to update book");
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};