import Expense from "../models/Expense.js";

import type { AppRequest } from "../types/http.js";

const handleDatabaseOperation = async <T>(operation: () => Promise<T> | T) => {
  try {
    return await operation();
  } catch (error) {
    console.error("Database operation error:", error);
    throw new Error("Database operation failed");
  }
};
export const created = async (req: AppRequest) =>
  handleDatabaseOperation(() => new Expense(req.body).save());
export const getAllExpense = async () =>
  handleDatabaseOperation(() => Expense.find());
