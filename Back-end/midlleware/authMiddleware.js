import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT ERROR:", err.name); // 🔥 DEBUG

    return res.status(401).json({
      message: err.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token",
    });
  }
};

export default authMiddleware