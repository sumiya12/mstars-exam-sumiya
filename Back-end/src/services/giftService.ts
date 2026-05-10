import GiftCard from "../models/GiftCard.js"; "./index.js";

import { Types } from "mongoose";
import type { AppRequest, RequestBody } from "../types/http.js";

const handleDatabaseOperation = async <T>(operation: () => Promise<T> | T) => {
    try {
        return await operation();
    } catch (error) {
        console.error("Database operation error:", error);
        throw new Error("Database operation failed");
    }
};
export const created = async (req: AppRequest) => handleDatabaseOperation(() => new GiftCard(req.body).save());
export const getAllGift = async (_req?: unknown) => handleDatabaseOperation(() => GiftCard.find());

export const update = async (id: string, data: RequestBody) => {
    const updatedGiftCard = await GiftCard.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    });

    return updatedGiftCard;
};

export const deleted = async (id: string) => {
    if (Types.ObjectId.isValid(id)) {
      return await GiftCard.findByIdAndDelete(id);
    }
    throw new Error("Invalid ID");
  };
  
