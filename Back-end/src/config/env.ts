import { config } from "dotenv";

config();

export const env = {
  port: process.env.PORT || "5000",
  mongoConnection: process.env.ATLAS_MONGO_CONNECTION,
  jwtSecret: process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "",
  canvasStorage: process.env.CANVAS_STORAGE || "local",
  canvasS3Bucket: process.env.CANVAS_S3_BUCKET || "",
  canvasS3Prefix: process.env.CANVAS_S3_PREFIX || "canvas-orders",
  canvasS3Region: process.env.CANVAS_S3_REGION || process.env.AWS_REGION || "",
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

  if (env.canvasStorage === "s3" && !env.canvasS3Bucket) {
    throw new Error(
      "Missing required environment variable: CANVAS_S3_BUCKET"
    );
  }

  if (env.canvasStorage === "s3" && !env.canvasS3Region) {
    throw new Error(
      "Missing required environment variable: CANVAS_S3_REGION"
    );
  }
};
