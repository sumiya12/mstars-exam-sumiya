// routes/userRoutes.js
import express from "express";
import {
  register,
  login,
  removeUser,
  listUsers,
  refreshAccessToken,
  updateUserById
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", authMiddleware, register);
router.post("/login", login);
router.post("/refresh", refreshAccessToken);

// хамгаалалттай routes
router.get("/", authMiddleware, listUsers);
router.put("/:id", authMiddleware, updateUserById);
router.delete("/:id", authMiddleware, removeUser);

export default router;
