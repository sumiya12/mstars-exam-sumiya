import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type JwtUser = {
  id: string;
  username?: string;
  userrealname?: string;
  role?: "admin" | "employee";
};

export type AuthenticatedRequest = Request & {
  user?: JwtUser;
};

const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "");
    req.user = decoded as JwtUser;
    next();
  } catch (err: any) {
    console.log("JWT ERROR:", err.name);

    return res.status(401).json({
      message: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

export default authMiddleware;
