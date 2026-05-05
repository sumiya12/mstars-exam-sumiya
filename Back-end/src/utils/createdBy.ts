import { Types } from "mongoose";
import User from "../modules/userModel.js";

export const createdByPopulateOptions = {
  path: "createdBy",
  select: "name username fullName userrealname role",
  skipInvalidIds: true,
  transform: (doc: unknown, id: unknown) => doc || id,
};

const addUniqueCandidate = (candidates: unknown[], value: unknown) => {
  if (!value) return;
  const normalized =
    value instanceof Types.ObjectId ? value.toString() : String(value).trim();

  if (!normalized) return;

  const exists = candidates.some((candidate) => {
    if (candidate instanceof Types.ObjectId) {
      return candidate.toString() === normalized;
    }

    return String(candidate) === normalized;
  });

  if (!exists) {
    candidates.push(value instanceof Types.ObjectId ? value : normalized);
  }
};

export const buildCreatedByMatchExpression = async (createdBy?: unknown) => {
  const value = String(createdBy || "").trim();
  if (!value) return null;

  const candidates: unknown[] = [];
  addUniqueCandidate(candidates, value);

  const userOrConditions: Record<string, unknown>[] = [
    { username: value },
    { userrealname: value },
  ];

  if (Types.ObjectId.isValid(value)) {
    const objectId = new Types.ObjectId(value);
    addUniqueCandidate(candidates, objectId);
    userOrConditions.unshift({ _id: objectId });
  }

  const users = await User.find({ $or: userOrConditions })
    .select("_id username userrealname")
    .lean();

  users.forEach((user: any) => {
    addUniqueCandidate(candidates, user._id);
    addUniqueCandidate(candidates, user.username);
    addUniqueCandidate(candidates, user.userrealname);
  });

  return { $in: ["$createdBy", candidates] };
};
