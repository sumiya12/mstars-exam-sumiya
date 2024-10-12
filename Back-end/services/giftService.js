import GiftCard from "../modules/giftModel.js"; "./index.js";

import { Types } from "mongoose";

const handleDatabaseOperation = async (operation) => {
    try {
        return await operation();
    } catch (error) {
        console.error("Database operation error:", error);
        throw new Error("Database operation failed");
    }
};
export const created = async (req) => handleDatabaseOperation(() => new GiftCard(req.body).save());
export const getAllGift = async () => handleDatabaseOperation(() => GiftCard.find());

export const update = async (id, req) => {
    await GiftCard.findByIdAndUpdate(id, req.body);
    return GiftCard.findById(id);
};

export const deleted = async (id) => {
    if (Types.ObjectId.isValid(id)) {
      return await GiftCard.findByIdAndDelete(id);
    }
    throw new Error("Invalid ID");
  };
  