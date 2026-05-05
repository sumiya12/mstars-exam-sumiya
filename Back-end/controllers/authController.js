import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../modules/userModel.js";

import { registerUser, deleteUser, getUsers } from "../modules/userService.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(
      req.body.username,
      req.body.password,
      req.body.userrealname
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
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
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    
    res.json({
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
    res.status(500).json({ message: "Server error" });
  }
};
export const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // 🔍 verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // user шалгах
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔥 шинэ access token үүсгэнэ
    const newAccessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        userrealname: user.userrealname,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.log("REFRESH ERROR:", error.name);

    return res.status(401).json({
      message: "Refresh token expired",
    });
  }
};

export const removeUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    await deleteUser(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
