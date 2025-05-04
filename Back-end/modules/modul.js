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
});
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
  description: { type: String },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  pickedUpCanvas: { type: Boolean, default: false },
});

const Book = model("Book", BookSchema);
export default Book;
