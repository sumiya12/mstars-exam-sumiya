import express from 'express';
const { Router } = express;

const router = Router();
import { fetchBooksByCanvas, createNewCanvas } from "../controllers/controller.js";

router.get("/get", fetchBooksByCanvas);
router.post("/create", createNewCanvas);
// router.put("/update", controller.update);
// router.delete("/delete/:id", controller.deletes);
// router.get("/getbyid/:id", controller.getById);
// router.get("/getbyday/:date", controller.getByDay);

export default router;
