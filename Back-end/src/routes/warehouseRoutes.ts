import express from "express";
import { getAllWarehouses, createWarehouseItem } from "../controllers/studioController.js";
const { Router } = express;

const router = Router();


// Route to get all warehouse items
router.get("/get", getAllWarehouses);

// Route to create a new warehouse item
router.post("/create", createWarehouseItem);

export default router;
