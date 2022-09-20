const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ISBN: { type: Number, minlength: 10, required: true, trim: true },
    author: { type: String, trim: true },
    price: { type: Number, trim: true },
    published_date: { type: Date },
  },
  { timestamps: true }
);

const Book = mongoose.model("Book", BookSchema);
module.exports = Book;
