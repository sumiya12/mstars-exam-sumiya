import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { hash, compare } from 'bcrypt';
import User from './userModel.js'; // Adjust the path based on your structure

export const registerUser = async (userData) => {
  const { username, password } = userData;
  const existingUser = await User.findOne({ username }); // Adjust to use the User model
  if (existingUser) {
    throw new Error('User already exists');
  }
  const hashedPassword = await hash(password, 10);
  const newUser = new User({
    username,
    password: hashedPassword,
  });
  return await newUser.save();
};
export const loginUser = async (username, password) => {
  const user = await User.findOne({ username }); // Adjust to use the User model
  if (!user) {
    throw new Error('Invalid username or password');
  }
  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid username or password');
  }
  const token = sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return { token, user };
};

