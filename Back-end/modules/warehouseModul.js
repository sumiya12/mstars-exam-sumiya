import { Schema, model } from "mongoose";

const WareHouseSchema = new Schema(
    {
        type: { type: String },
        size: { type: String },
        quantity: { type: Number },
    },
    { timestamps: true }
);

const WareHouse = model("WareHouse", WareHouseSchema);
export default WareHouse;
