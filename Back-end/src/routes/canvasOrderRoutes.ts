import path from "node:path";
import crypto from "node:crypto";
import express from "express";
import multer from "multer";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  deleteCanvasFile,
  downloadCanvasFile,
  getCanvasOrders,
  previewCanvasFile,
  updateCanvasRepairNote,
  uploadCanvasFiles,
  uploadRoot,
} from "../controllers/canvasOrderController.js";

const router = express.Router();

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadRoot),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    files: 20,
    fileSize: 60 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.has(extension)) {
      callback(new Error("Зөвхөн зураг файл upload хийнэ"));
      return;
    }
    callback(null, true);
  },
});

router.use(authMiddleware);
router.get("/", getCanvasOrders);
router.patch("/:bookId/repair-note", updateCanvasRepairNote);
router.post("/:bookId/files", upload.array("files", 20), uploadCanvasFiles);
router.get("/files/:fileId/preview", previewCanvasFile);
router.get("/files/:fileId", downloadCanvasFile);
router.delete("/files/:fileId", deleteCanvasFile);

export default router;
