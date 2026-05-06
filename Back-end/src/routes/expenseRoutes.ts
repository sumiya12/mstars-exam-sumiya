import { Router } from "express";
import { createExpense, listExpenses, updateExpense, deleteExpense } from "../controllers/expenseController.js";

const router = Router();

router.get("/", listExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);      // ✅ edit
router.delete("/:id", deleteExpense);   // ✅ delete

export default router;
