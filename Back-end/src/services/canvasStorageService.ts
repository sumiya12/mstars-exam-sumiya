import { createReadStream } from "node:fs";
import path from "node:path";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../config/env.js";

const s3Client = new S3Client({ region: env.canvasS3Region });
const normalizedPrefix = env.canvasS3Prefix.replace(/^\/+|\/+$/g, "");

export const usesCanvasS3 = env.canvasStorage === "s3";

export const createCanvasObjectKey = (
  bookId: string,
  storedName: string
) => path.posix.join(normalizedPrefix, bookId, storedName);

export const uploadCanvasObject = async (
  filePath: string,
  objectKey: string,
  mimeType: string,
  originalName: string
) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.canvasS3Bucket,
      Key: objectKey,
      Body: createReadStream(filePath),
      ContentType: mimeType,
      Metadata: {
        originalname: encodeURIComponent(originalName),
      },
    })
  );
};

export const uploadCanvasPreview = async (
  body: Buffer,
  objectKey: string
) => {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: env.canvasS3Bucket,
      Key: objectKey,
      Body: body,
      ContentType: "image/jpeg",
      CacheControl: "private, max-age=3600",
    })
  );
};

export const getCanvasObject = (objectKey: string) =>
  s3Client.send(
    new GetObjectCommand({
      Bucket: env.canvasS3Bucket,
      Key: objectKey,
    })
  );

export const deleteCanvasObject = (objectKey: string) =>
  s3Client.send(
    new DeleteObjectCommand({
      Bucket: env.canvasS3Bucket,
      Key: objectKey,
    })
  );
