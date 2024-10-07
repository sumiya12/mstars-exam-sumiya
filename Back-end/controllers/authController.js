import { Router } from "express";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken"; // Import the entire module
// import { findOne } from "./path/to/userModel"; // Adjust the path to your User model

const router = Router();

// POST /api/login
router.post("/", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await findOne({ username }); // Ensure you have this function implemented
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Check password
        const isMatch = await compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        // Create a JWT token
        const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1h" });

        res.json({
            success: true,
            message: "Login successful",
            token, // Send token to client
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;
