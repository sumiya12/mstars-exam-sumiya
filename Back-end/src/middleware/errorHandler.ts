import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
  
    res.status(400).json({
      message: err.message || "Server error",
    });
  };
