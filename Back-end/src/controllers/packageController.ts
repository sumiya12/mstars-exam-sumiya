import * as packageService from "../services/packageService.js";
import type { Response } from "express";
import type { AppRequest } from "../types/http.js";

export const getPackages = async (_req: AppRequest, res: Response) => {
  const data = await packageService.getAll();
  res.json(data);
};

export const createPackage = async (req: AppRequest, res: Response) => {
  const result = await packageService.create(req.body);
  res.json(result);
};

export const deletePackage = async (
  req: AppRequest<{ id: string }>,
  res: Response
) => {
  await packageService.remove(req.params.id, req.user);
  res.json({ success: true });
};
export const editPackage = async (
  req: AppRequest<{ id: string }>,
  res: Response
) => {
  try {
    const result = await packageService.edit(req.params.id, req.body, req.user);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
