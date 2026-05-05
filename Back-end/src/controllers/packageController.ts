import * as packageService from "../services/packageService.js";

export const getPackages = async (req, res) => {
  const data = await packageService.getAll();
  res.json(data);
};

export const createPackage = async (req, res) => {
  const result = await packageService.create(req.body);
  res.json(result);
};

export const deletePackage = async (req, res) => {
  await packageService.remove(req.params.id, req.user);
  res.json({ success: true });
};
export const editPackage = async (req, res) => {
  try {
    const result = await packageService.edit(req.params.id, req.body, req.user);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
