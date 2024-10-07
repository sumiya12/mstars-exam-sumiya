import { Schema, model } from "mongoose";

const giftPhotoSchema = new Schema({
  size: { type: String },
  count: { type: Number },
});
const paperSchema = new Schema({
  size: { type: String },
  count: { type: Number },
})
const frameSchema = new Schema({
  size: { type: String },
  count: { type: Number },
})
const frameAndPaperSchema = new Schema({
  size: { type: String },
  count: { type: Number },
})
const BookSchema = new Schema(
  {
    day: { type: String },
    bookedTime: { type: String, trim: true },
    packageName: { type: String, trim: true },
    prePay: { type: Number },
    postPay: { type: Number },
    giftPhoto: { type: Boolean },
    pictures: [giftPhotoSchema],
    paper: [paperSchema],
    frame: [frameSchema],
    frameAndPaper: [frameAndPaperSchema],
    paymenType: { type: String },
    description: { type: String },
  }
);

const Book = model("Book", BookSchema);
export default Book;
