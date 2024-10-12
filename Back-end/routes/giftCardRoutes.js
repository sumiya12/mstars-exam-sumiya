import express from 'express';
const { Router } = express;

const router = Router();
import { createNewGiftCard, deleteGiftCard, getAllGiftCard, updateGiftCard } from "../controllers/giftController.js";

router.get("/get", getAllGiftCard);
router.post("/create", createNewGiftCard);
router.put("/update/:id", updateGiftCard);
router.delete("/delete/:id", deleteGiftCard);
// router.get("/getbyid/:id", controller.getById);
// router.get("/getbyday/:date", controller.getByDay);

export default router;