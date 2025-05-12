import { Schema, model } from "mongoose";

const expenseSchema = new Schema(
  {
    expense_amount: { type: Number , required: true },
    description: { type: String },
    first_balance: { type: Number, required: true },
    balance: { type: Number , required: true },
    createdAt: { type: String },
  },
  { timestamps: true }
);

const Expense = model("Expense", expenseSchema);
export default Expense;
