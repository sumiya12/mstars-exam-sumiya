import { Schema, model } from "mongoose";

const giftPhotoSchema = new Schema({
  size: { type: String },
  count: { type: Number },
});
const paperSchema = new Schema({
  size: { type: String },
  count: { type: Number },
});
const frameSchema = new Schema({
  size: { type: String },
  count: { type: Number },
});
const frameAndPaperSchema = new Schema({
  size: { type: String },
  count: { type: Number },
});
const canvasSchema = new Schema({
  size: { type: String },
  code: { type: String },
  price: { type: Number },
  realPrice: { type: Number },
});
const paymentBreakdownSchema = new Schema(
  {
    cash: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    account: { type: Number, default: 0 },
  },
  { _id: false }
);

const BookSchema = new Schema({
  year: { type: String },
  day: { type: String },
  bookedTime: { type: String, trim: true },
  packageName: { type: String, trim: true },
  prePay: { type: Number },
  postPay: { type: Number },
  addPayment: { type: Number },
  minusPayment: { type: Number },
  giftPhoto: { type: Boolean },
  pictures: [giftPhotoSchema],
  paper: [paperSchema],
  frame: [frameSchema],
  frameAndPaper: [frameAndPaperSchema],
  canvas: [canvasSchema],
  paymenType: { type: String },
  paymentBreakdown: { type: paymentBreakdownSchema, default: () => ({}) },
  description: { type: String },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  pickedUpCanvas: { type: Boolean, default: false },
});

const Book = model("Book", BookSchema);
export default Book;
