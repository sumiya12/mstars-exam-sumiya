import { Router } from "express";
const router = Router();
import { getAllWarehouses, createWarehouseItem } from "../controllers/controller.js";

// Route to get all warehouse items
router.get("/get", getAllWarehouses);

// Route to create a new warehouse item
router.post("/create", createWarehouseItem);

// Uncomment and adjust these routes as needed
// router.put("/update/:id", controller.update);
// router.delete("/delete/:id", controller.deleted);
// router.get("/getbyid/:id", controller.getById);
// router.get("/getbyday/:date", controller.getByDay);

export default router;
