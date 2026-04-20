// routes/userRoutes.js
import express from "express";
import {
  register,
  login,
  removeUser,
  listUsers,
} from "../controllers/authController.js";

import authMiddleware from "../midlleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// хамгаалалттай routes
router.get("/", authMiddleware, listUsers);
router.delete("/:id", authMiddleware, removeUser);

export default router;
