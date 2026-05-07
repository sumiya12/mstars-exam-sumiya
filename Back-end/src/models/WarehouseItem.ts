import { Schema, model } from "mongoose";

const WareHouseSchema = new Schema(
  {
    type: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const WareHouse = model("WareHouse", WareHouseSchema);
export default WareHouse;
