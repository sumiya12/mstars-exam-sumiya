import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    businessType: {
      type: String,
      enum: ["PICSHOT", "PICO_KIDS", "GROCERIES"],
      required: true,
    },
    expenseCategory: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    paymentType: {
      type: String,
      enum: ["CASH", "ACCOUNT", "QPAY"],
      required: true,
    },
    date: { type: String, required: true }, // YYYY-MM-DD
    description: { type: String, default: "" },
    supplier: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);
