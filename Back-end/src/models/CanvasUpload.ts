import { Schema, model } from "mongoose";

const CanvasUploadSchema = new Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const CanvasUpload = model("CanvasUpload", CanvasUploadSchema);

export default CanvasUpload;
