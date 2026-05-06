import express from "express";
import {
  createPartyOrder,
  getPartyOrders,
  updatePartyOrder,
  deletePartyOrder,
} from "../controllers/partyOrderController.js";

const router = express.Router();

router.post("/create", createPartyOrder);
router.get("/get", getPartyOrders);
router.put("/update/:id", updatePartyOrder);
router.delete("/delete/:id", deletePartyOrder);

export default router;
