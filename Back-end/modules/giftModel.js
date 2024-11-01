import { Schema, model } from "mongoose";

const GiftCardSchema = new Schema(
    {
        package: { type: String },
        code: { type: String },
        instagram: { type: String },
        phone: { type: Number },
        comephone: { type: Number },
    },
    { timestamps: true }
);

const GiftCard = model("GiftCard", GiftCardSchema);
export default GiftCard;
