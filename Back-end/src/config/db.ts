import { connect, set } from "mongoose";
import { env } from "./env.js";

export const connectDatabase = async () => {
  if (!env.mongoConnection) {
    throw new Error("ATLAS_MONGO_CONNECTION is not configured");
  }

  set("strictQuery", true);
  await connect(env.mongoConnection);
};
