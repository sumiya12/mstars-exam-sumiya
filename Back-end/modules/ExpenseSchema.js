import { Schema, model } from "mongoose";

const expenseSchemaDefinition = new Schema(
  {
    expense_amount: { type: Number },
    description: { type: String },
    firstbalance: { type: Number },
    balance: { type: Number },
    createdAt: { type: String },
  },
  { timestamps: true }
);

const ExpenseSchema = model("ExpenseSchema", expenseSchemaDefinition);
export default ExpenseSchema;
