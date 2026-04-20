// controllers/userController.js
import {
  registerUser,
  loginUser,
  deleteUser,
  getUsers,
} from "../modules/userService.js";

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
  try {
    const data = await loginUser(
      req.body.username,
      req.body.password,
      req.body.userrealname
    );
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeUser = async (req, res) => {
  try {
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
