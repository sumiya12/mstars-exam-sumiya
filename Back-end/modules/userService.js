// services/userService.js
import User from "./userModel.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (username, password, userrealname) => {
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const user = new User({ username, password, userrealname }); // pre('save') hash хийнэ
  await user.save();

  return user;
};

export const loginUser = async (username, password, userrealname) => {
  const user = await User.findOne({ username });
  if (!user) throw new Error("Invalid username or password");

  const isMatch = await compare(password, user.password);
  if (!isMatch) throw new Error("Invalid username or password");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return { token, user, userrealname };
};

export const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

export const getUsers = async () => {
  return await User.find().select("-password");
};
