import type { Response } from "express";

export const handleResponse = (
  res: Response,
  data: any,
  successMessage: string,
  errorMessage: string,
  successStatus = 200
) => {
  if (data && data.success !== false) {
    return res
      .status(successStatus)
      .json({ success: true, message: successMessage, data });
  }

  return res
    .status(404)
    .json({ success: false, message: errorMessage, data });
};
