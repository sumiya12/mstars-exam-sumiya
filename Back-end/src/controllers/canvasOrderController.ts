import fs from "node:fs/promises";
import path from "node:path";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Response } from "express";
import sharp from "sharp";
import type { AppRequest } from "../types/http.js";
import Book from "../models/Book.js";
import CanvasUpload from "../models/CanvasUpload.js";
import { getBookingSiteBookingModel } from "../models/BookingSiteBooking.js";
import { createdByPopulateOptions } from "../utils/createdBy.js";
import {
  createCanvasObjectKey,
  deleteCanvasObject,
  getCanvasObject,
  uploadCanvasObject,
  uploadCanvasPreview,
  usesCanvasS3,
} from "../services/canvasStorageService.js";

const uploadRoot = path.resolve(
  process.env.CANVAS_UPLOAD_DIR || path.join(process.cwd(), "uploads", "canvas")
);

const toMinutes = (value = "") => {
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : Number.NaN;
};

const normalizeText = (value = "") =>
  value
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const getPackageScore = (left = "", right = "") => {
  const leftTokens = new Set(normalizeText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(" ").filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;

  let matches = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) matches += 1;
  });

  return matches / Math.max(leftTokens.size, rightTokens.size);
};

export const getCanvasOrders = async (req: AppRequest, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const requestedPage = Number.parseInt(String(req.query.page || "1"), 10);
    const requestedPageSize = Number.parseInt(
      String(req.query.pageSize || "50"),
      10
    );
    const page = Number.isFinite(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(100, Math.max(10, requestedPageSize))
      : 50;
    const baseQuery = { "canvas.0": { $exists: true } };
    const normalizedSearch = normalizeText(search);
    const shouldSearchAll = Boolean(normalizedSearch);

    const totalBooks = shouldSearchAll
      ? 0
      : await Book.countDocuments(baseQuery);
    const bookQuery = Book.find(baseQuery)
      .populate(createdByPopulateOptions)
      .sort({ createdAt: -1 });

    if (!shouldSearchAll) {
      bookQuery.skip((page - 1) * pageSize).limit(pageSize);
    }

    const books = await bookQuery.lean();

    const bookIds = books.map((book) => book._id);
    const uploads = await CanvasUpload.find({ bookId: { $in: bookIds } })
      .populate("uploadedBy", "username userrealname")
      .sort({ createdAt: -1 })
      .lean();

    const uploadsByBook = new Map<string, typeof uploads>();
    uploads.forEach((upload) => {
      const key = String(upload.bookId);
      const current = uploadsByBook.get(key) || [];
      current.push(upload);
      uploadsByBook.set(key, current);
    });

    const dates = books
      .map((book) => `${book.year}-${book.day}`)
      .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
    const BookingSiteBooking = getBookingSiteBookingModel();
    const bookingQuery =
      dates.length > 0
        ? {
            status: { $ne: "cancelled" },
            date: {
              $gte: dates.reduce((min, date) => (date < min ? date : min)),
              $lte: dates.reduce((max, date) => (date > max ? date : max)),
            },
          }
        : { _id: { $exists: false } };
    const bookings = await BookingSiteBooking.find(bookingQuery).lean();

    const orders = books.map((book) => {
      const bookingDate = `${book.year}-${book.day}`;
      const bookMinutes = toMinutes(book.bookedTime);
      const match = bookings
        .filter((booking) => booking.date === bookingDate)
        .map((booking) => ({
          booking,
          timeDiff: Math.abs(toMinutes(booking.time) - bookMinutes),
          packageScore: getPackageScore(booking.eventTitle, book.packageName),
        }))
        .filter(({ timeDiff }) => Number.isFinite(timeDiff) && timeDiff <= 30)
        .sort(
          (a, b) =>
            b.packageScore - a.packageScore || a.timeDiff - b.timeDiff
        )[0]?.booking;

      return {
        ...book,
        customer: match
          ? {
              name: match.name || "",
              phone: match.phone || "",
              email: match.email || "",
              bookingId: match.id,
            }
          : null,
        uploads: (uploadsByBook.get(String(book._id)) || []).map((upload) => ({
          _id: upload._id,
          originalName: upload.originalName,
          mimeType: upload.mimeType,
          size: upload.size,
          hasPreview: Boolean(upload.previewObjectKey),
          createdAt: upload.createdAt,
          uploadedBy: upload.uploadedBy,
        })),
      };
    });

    const filteredOrders = normalizedSearch
      ? orders.filter((order) =>
          normalizeText(
            [
              order.customer?.name,
              order.customer?.phone,
              order.customer?.email,
              order.packageName,
              ...(order.canvas || []).map((item) => item.code),
            ].join(" ")
          ).includes(normalizedSearch)
        )
      : orders;
    const total = shouldSearchAll ? filteredOrders.length : totalBooks;
    const pagedOrders = shouldSearchAll
      ? filteredOrders.slice((page - 1) * pageSize, page * pageSize)
      : filteredOrders;

    res.json({
      success: true,
      data: pagedOrders,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Canvas order fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Canvas захиалгын мэдээлэл татаж чадсангүй",
    });
  }
};

export const updateCanvasRepairNote = async (
  req: AppRequest,
  res: Response
) => {
  try {
    const repairNote =
      typeof req.body?.repairNote === "string" ? req.body.repairNote.trim() : "";

    if (repairNote.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Засварын тайлбар 2000 тэмдэгтээс ихгүй байна",
      });
    }

    const book = await Book.findOneAndUpdate(
      {
        _id: req.params.bookId,
        "canvas.0": { $exists: true },
      },
      { $set: { canvasRepairNote: repairNote } },
      { new: true, runValidators: true }
    ).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Canvas захиалга олдсонгүй",
      });
    }

    res.json({
      success: true,
      data: {
        _id: book._id,
        canvasRepairNote: book.canvasRepairNote || "",
      },
    });
  } catch (error) {
    console.error("Canvas repair note update error:", error);
    res.status(500).json({
      success: false,
      message: "Засварын тайлбар хадгалж чадсангүй",
    });
  }
};

export const uploadCanvasFiles = async (req: AppRequest, res: Response) => {
  const files = (req.files || []) as Express.Multer.File[];
  const uploadedObjectKeys: string[] = [];

  try {
    const book = await Book.findOne({
      _id: req.params.bookId,
      "canvas.0": { $exists: true },
    }).lean();

    if (!book) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch((): void => undefined))
      );
      return res.status(404).json({ message: "Canvas захиалга олдсонгүй" });
    }

    const uploadedBy = req.user?._id || req.user?.id;
    if (!uploadedBy) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch((): void => undefined))
      );
      return res.status(401).json({ message: "Нэвтрэх шаардлагатай" });
    }

    const records = [];
    for (const file of files) {
      const objectKey = usesCanvasS3
        ? createCanvasObjectKey(String(book._id), file.filename)
        : undefined;
      let previewObjectKey: string | undefined;

      if (objectKey) {
        await uploadCanvasObject(
          file.path,
          objectKey,
          file.mimetype,
          file.originalname
        );
        uploadedObjectKeys.push(objectKey);

        try {
          const preview = await sharp(file.path)
            .rotate()
            .resize({
              width: 1200,
              height: 1200,
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 78, mozjpeg: true })
            .toBuffer();
          previewObjectKey = `${objectKey}.preview.jpg`;
          await uploadCanvasPreview(preview, previewObjectKey);
          uploadedObjectKeys.push(previewObjectKey);
        } catch (previewError) {
          console.warn(
            `Canvas preview generation skipped for ${file.originalname}:`,
            previewError
          );
        }
      }

      records.push({
        bookId: book._id,
        originalName: file.originalname,
        storedName: file.filename,
        storageProvider: usesCanvasS3 ? "s3" : "local",
        objectKey,
        previewObjectKey,
        previewMimeType: previewObjectKey ? "image/jpeg" : undefined,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy,
      });
    }

    const saved = await CanvasUpload.insertMany(records);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    await Promise.all(
      uploadedObjectKeys.map((objectKey) =>
        deleteCanvasObject(objectKey).catch((): void => undefined)
      )
    );
    if (!usesCanvasS3) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch((): void => undefined))
      );
    }
    console.error("Canvas upload error:", error);
    res.status(500).json({
      success: false,
      message: "Зураг upload хийж чадсангүй",
    });
  } finally {
    if (usesCanvasS3) {
      await Promise.all(
        files.map((file) => fs.unlink(file.path).catch((): void => undefined))
      );
    }
  }
};

export const previewCanvasFile = async (req: AppRequest, res: Response) => {
  const upload = await CanvasUpload.findById(req.params.fileId).lean();
  if (!upload) return res.status(404).json({ message: "Файл олдсонгүй" });

  res.set({
    "Cache-Control": "private, max-age=3600",
    "Content-Type": upload.previewMimeType || upload.mimeType || "image/jpeg",
    "Content-Disposition": `inline; filename="${encodeURIComponent(
      upload.originalName
    )}"`,
  });

  if (upload.storageProvider === "s3" && upload.objectKey) {
    try {
      const object = await getCanvasObject(
        upload.previewObjectKey || upload.objectKey
      );
      if (!object.Body) {
        return res.status(404).json({ message: "Preview олдсонгүй" });
      }
      if (object.ContentLength !== undefined) {
        res.setHeader("Content-Length", String(object.ContentLength));
      }
      await pipeline(object.Body as Readable, res);
      return;
    } catch (error) {
      console.error("Canvas preview error:", error);
      if (!res.headersSent) {
        return res.status(404).json({ message: "Preview харуулж чадсангүй" });
      }
      return;
    }
  }

  const filePath = path.join(uploadRoot, upload.storedName);
  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ message: "Preview файл олдсонгүй" });
    }
  });
};

export const downloadCanvasFile = async (req: AppRequest, res: Response) => {
  const upload = await CanvasUpload.findById(req.params.fileId).lean();
  if (!upload) return res.status(404).json({ message: "Файл олдсонгүй" });

  res.set({
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Content-Type": upload.mimeType || "application/octet-stream",
  });
  res.attachment(upload.originalName);

  if (upload.storageProvider === "s3" && upload.objectKey) {
    try {
      const object = await getCanvasObject(upload.objectKey);
      if (!object.Body) {
        return res.status(404).json({ message: "S3 файл олдсонгүй" });
      }
      if (object.ContentLength !== undefined) {
        res.setHeader("Content-Length", String(object.ContentLength));
      }
      await pipeline(object.Body as Readable, res);
      return;
    } catch (error) {
      console.error("Canvas S3 download error:", error);
      if (!res.headersSent) {
        return res.status(404).json({ message: "S3 файл татаж чадсангүй" });
      }
      return;
    }
  }

  const filePath = path.join(uploadRoot, upload.storedName);
  res.download(filePath, upload.originalName, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ message: "Файл диск дээр олдсонгүй" });
    }
  });
};

export const deleteCanvasFile = async (req: AppRequest, res: Response) => {
  try {
    const upload = await CanvasUpload.findById(req.params.fileId).lean();
    if (!upload) return res.status(404).json({ message: "Файл олдсонгүй" });

    if (upload.storageProvider === "s3" && upload.objectKey) {
      await deleteCanvasObject(upload.objectKey);
      if (upload.previewObjectKey) {
        await deleteCanvasObject(upload.previewObjectKey);
      }
    } else {
      await fs
        .unlink(path.join(uploadRoot, upload.storedName))
        .catch((): void => undefined);
    }

    await CanvasUpload.deleteOne({ _id: upload._id });
    res.json({ success: true });
  } catch (error) {
    console.error("Canvas file delete error:", error);
    res.status(500).json({ success: false, message: "Файл устгаж чадсангүй" });
  }
};

export { uploadRoot };
