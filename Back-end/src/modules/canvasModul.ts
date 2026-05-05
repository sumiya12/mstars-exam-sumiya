import { Schema, model } from "mongoose";

const pictureSchema = new Schema({
    size: { type: String },
    code: { type: Number },
    price: { type: Number }
});

const CanvasSchema = new Schema(
    {
        day: { type: String },
        time: { type: String },
        phone: { type: String },
        mail: { type: Boolean },
        pictures: [pictureSchema],
    },
);

const Canvas = model("Canvas", CanvasSchema);
export default Canvas;
