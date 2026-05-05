import express from "express";
import * as controller from "../controllers/packageController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get", controller.getPackages);

router.post("/", controller.createPackage);

router.delete("/delete:id", controller.deletePackage);

router.put("/:id", controller.editPackage);

export default router;
