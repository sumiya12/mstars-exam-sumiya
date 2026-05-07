import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

type UserRole = "admin" | "employee";
type ServiceError = Error & { statusCode?: number };

export const registerUser = async (
  username: string,
  password: string,
  userrealname: string,
  role: UserRole = "employee"
) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = new User({ username, password, userrealname, role });
  await user.save();

  return user;
};

export const loginUser = async (
  username: string,
  password: string,
  userrealname: string
) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Invalid username or password");

  const isMatch = await compare(password, user.password);
  if (!isMatch) throw new Error("Invalid username or password");

  const token = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      userrealname: user.userrealname,
      role: user.role,
    },
    process.env.JWT_SECRET || "",
    { expiresIn: "1h" }
  );

  return { token, user, userrealname };
};

export const updateUser = async (
  userId: string,
  data: Partial<{
    username: string;
    password: string;
    userrealname: string;
    role: UserRole;
  }>
) => {
  const user = await User.findById(userId);

  if (!user) {
    const error: ServiceError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.username && data.username !== user.username) {
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      const error: ServiceError = new Error("Username already exists");
      error.statusCode = 400;
      throw error;
    }
    user.username = data.username;
  }

  if (data.userrealname) user.userrealname = data.userrealname;
  if (data.password) user.password = data.password;

  if (data.role && data.role !== user.role) {
    if (user.role === "admin" && data.role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        const error: ServiceError = new Error("Last admin cannot be demoted");
        error.statusCode = 403;
        throw error;
      }
    }

    user.role = data.role;
  }

  await user.save();
  return user.toObject();
};

export const deleteUser = async (userId: string) => {
  const userToDelete = await User.findById(userId);

  if (!userToDelete) {
    const error: ServiceError = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (userToDelete.role === "admin") {
    const error: ServiceError = new Error("Admin user cannot be deleted");
    error.statusCode = 403;
    throw error;
  }

  return await User.findByIdAndDelete(userId);
};

export const getUsers = async () => {
  return await User.find().select("-password").sort({ role: 1, username: 1 });
};
