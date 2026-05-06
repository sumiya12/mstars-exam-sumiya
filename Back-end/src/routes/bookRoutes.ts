import pkg from "express";
const { Router } = pkg;
const router = Router();
import {
  getAllBooks,
  createBook,
  deleteBook,
  updateBook,
  getAllBookForChart,
  updateIsCanvasCheck,
} from "../controllers/studioController.js";
import {
  getDailySummary,
  getMonthlySummary,
  getPaymenTypeOfMonthly,
} from "../controllers/summaryController.js";
import authMiddleware from "../middleware/authMiddleware.js";

router.get("/get", getAllBooks);
router.get("/getall", getAllBookForChart);
router.post("/create", authMiddleware, createBook);
router.put("/update/:id", updateBook);
router.delete("/delete/:id", deleteBook);
router.get("/daily-summary", getDailySummary);
router.get("/monthly-summary", getMonthlySummary);
router.get("/monthly-payment-types", getPaymenTypeOfMonthly);
router.put("/updatecanvas/:id", updateIsCanvasCheck);

export default router;
