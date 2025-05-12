import express from "express";
const { Router } = express;

const router = Router();
import {
  getTotal,
  registerExpense,
  getMonthlyExpenses,
  getLatestExpense
} from "../controllers/expenseController.js";

router.get("/get", getTotal);
router.get("/getall", getMonthlyExpenses);
router.post("/create", registerExpense);
router.get("/latest", getLatestExpense);
// router.put("/update/:id", updatedCanvas);
// router.delete("/delete/:id", deletedCanvas);
// router.get("/getbyid/:id", controller.getById);
// router.get("/getbyday/:date", controller.getByDay);

export default router;
