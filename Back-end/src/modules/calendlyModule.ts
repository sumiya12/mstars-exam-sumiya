import { Schema, model } from "mongoose";

const calendlySchema = new Schema({
  date: { type: String },
  name: { type: String },
  package: { type: String },
  email: { type: String },
  phone: { type: String },
  count: { type: String },
  time: { type: String },
  payment: { type: String },
  created_at: { type: String },
});

const Calendly = model("Calendly", calendlySchema);
export default Calendly;
