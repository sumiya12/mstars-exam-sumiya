import Package from "../models/Package.js";
import { validatePackage } from "../utils/validator.js";

export const getAll = async () => {
  return await Package.find().sort({ createdAt: -1 });
};
export const create = async (data) => {
  if (!data?.label?.trim()) {
    throw new Error("Label missing");
  }

  const options = data.options || [];

  return await Package.create({
    label: data.label,
    options,
  });
};

export const remove = async (id, user?: unknown) => {
  // if (user.role !== "admin") {
  //   throw new Error("Forbidden");
  // }

  const pkg = await Package.findById(id);

  if (!pkg) {
    throw new Error("Not found");
  }

  return await Package.findByIdAndDelete(id);
};

export const edit = async (id, data, user?: unknown) => {
  const updated = await Package.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );

  if (!updated) throw new Error("Not found");

  return updated;
};
