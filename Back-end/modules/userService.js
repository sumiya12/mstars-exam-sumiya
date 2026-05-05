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

  const token = jwt.sign(
    {
      _id: user._id,
      username: user.username,
      userrealname: user.userrealname,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token, user, userrealname };
};

export const deleteUser = async (userId) => {
  const userToDelete = await User.findById(req.params.id);

  if (!userToDelete) {
    return res.status(404).json({ message: "User not found" });
  }

  // 🔥 ADMIN USER УСТГАХЫГ ХОРИГЛОНО
  if (userToDelete.role === "admin") {
    return res.status(403).json({ message: "Admin user устгах боломжгүй" });
  }

  // зөвхөн admin delete хийж болно
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "cant delete admin user" });
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true });
};

export const getUsers = async () => {
  return await User.find().select("-password");
};
