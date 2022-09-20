const Book = require("./modul");
const mongoose = require("mongoose");

const create = async (req) => {
  const crud = new Book(req.body);
  return crud.save();
};

const get = async (req) => {
  return Book.find();
};

const getBy = async (req) => {
  const { id } = req.params;
  if (mongoose.Types.ObjectId.isValid(id)) return Book.findById(id);
};

const update = async (req) => {
  const { id } = req.query;
  console.log(id);
  await Book.findByIdAndUpdate(id, req.body);
  return Book.findById(id);
};

const deletes = async (req) => {
  const { id } = req.params;
  return Book.findByIdAndDelete(id, req.body);
};
module.exports = { create, get, update, deletes, getBy };
