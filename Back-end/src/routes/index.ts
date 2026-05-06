import express from "express";
const router = express.Router();
import bookRoutes from "./bookRoutes.js";
import warehouseRoutes from "./warehouseRoutes.js";
import giftCardRoutes from "./giftCardRoutes.js";
import timeLogRoutes from "./timeLogRoutes.js";
import calendlyRoutes from "./calendlyRoutes.js";
import expenseRoutes from "./expenseRoutes.js";
import authRoutes from "./authRoutes.js";
import packageRoutes from "./packageRoutes.js";
import partyOrderRoutes from "./partyOrderRoutes.js";

router.use("/book", bookRoutes);
router.use("/warehouse", warehouseRoutes);
router.use("/giftcard", giftCardRoutes);
router.use("/time", timeLogRoutes);
router.use("/picshot", calendlyRoutes);
router.use("/expense", expenseRoutes);
router.use("/auth", authRoutes);
router.use("/package", packageRoutes);
router.use("/party-order", partyOrderRoutes);

export default router;
