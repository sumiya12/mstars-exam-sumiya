import express from 'express';
const { Router } = express;

const router = Router();
import { getAllCanvas, createNewCanvas, deletedCanvas, updatedCanvas } from "../controllers/controller.js";

router.get("/get", getAllCanvas);
router.post("/create", createNewCanvas);
router.put("/update/:id", updatedCanvas);
router.delete("/delete/:id", deletedCanvas);
// router.get("/getbyid/:id", controller.getById);
// router.get("/getbyday/:date", controller.getByDay);

export default router;
