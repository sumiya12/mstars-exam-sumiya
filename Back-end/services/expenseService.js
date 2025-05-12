import Expense from "../modules/ExpenseSchema.js";

const handleDatabaseOperation = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);
    throw new Error("Database operation failed");
  }
};
export const created = async (req) =>
  handleDatabaseOperation(() => new Expense(req.body).save());
export const getAllExpense = async () =>
  handleDatabaseOperation(() => Expense.find());
