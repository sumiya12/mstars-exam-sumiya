import express from "express";
import {
  createPartyOrder,
  getPartyOrders,
  deletePartyOrder,
} from "../controllers/partyOrderController.js";

const router = express.Router();

router.post("/create", createPartyOrder);
router.get("/get", getPartyOrders);
router.delete("/delete/:id", deletePartyOrder);

export default router;