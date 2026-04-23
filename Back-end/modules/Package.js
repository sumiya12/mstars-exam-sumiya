// models/Package.js
import { Schema, model } from "mongoose";

const PackageOptionSchema = new Schema({
  value: String,
  label: String,
  price: Number,
});

const PackageGroupSchema = new Schema({
  label: String,
  options: [PackageOptionSchema],
});

export default model("Package", PackageGroupSchema);