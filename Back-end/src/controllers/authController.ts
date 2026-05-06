import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import { deleteUser, getUsers, registerUser } from "../services/userService.js";

type UserRole = "admin" | "employee";

type RegisterBody = {
  username: string;
  password: string;
  userrealname: string;
  role?: UserRole;
};

type LoginBody = {
  username: string;
  password: string;
};

export const register = async (
  req: Request<unknown, unknown, RegisterBody>,
  res: Response
) => {
  try {
    if (req.body.role && !["admin", "employee"].includes(req.body.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await registerUser(
      req.body.username,
      req.body.password,
      req.body.userrealname,
      req.body.role
    );

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({ success: true, user: safeUser });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const login = async (
  req: Request<unknown, unknown, LoginBody>,
  res: Response
) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        userrealname: user.userrealname,
        role: user.role,
      },
      process.env.JWT_SECRET || "",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET || "",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        userrealname: user.userrealname,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const refreshAccessToken = async (
  req: Request<unknown, unknown, { refreshToken?: string }>,
  res: Response
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || ""
    ) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        userrealname: user.userrealname,
        role: user.role,
      },
      process.env.JWT_SECRET || "",
      { expiresIn: "15m" }
    );

    return res.json({
      success: true,
      accessToken,
    });
  } catch (error: any) {
    console.log("REFRESH ERROR:", error.name);

    return res.status(401).json({
      message: "Refresh token expired",
    });
  }
};

export const removeUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await deleteUser(req.params.id);
    return res.json({ success: true, message: "User deleted" });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ message: err.message });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.json(users);
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
