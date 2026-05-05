import { config } from "dotenv";

config();

export const env = {
  port: process.env.PORT || "5000",
  mongoConnection: process.env.ATLAS_MONGO_CONNECTION,
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
};

export const assertRequiredEnv = () => {
  const missing = [
    ["ATLAS_MONGO_CONNECTION", env.mongoConnection],
    ["JWT_SECRET", env.jwtSecret],
    ["JWT_REFRESH_SECRET", env.jwtRefreshSecret],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing
        .map(([key]) => key)
        .join(", ")}`
    );
  }
};
