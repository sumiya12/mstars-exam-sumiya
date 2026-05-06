import { Types, disconnect } from "mongoose";
import { connectDatabase } from "../config/db.js";
import Book from "../models/Book.js";
import User from "../models/User.js";

const findUserForLegacyValue = async (value: string) => {
  if (Types.ObjectId.isValid(value)) {
    const userById = await User.findById(value).select("_id").lean();
    if (userById) return userById;
  }

  return User.findOne({
    $or: [{ username: value }, { userrealname: value }],
  })
    .select("_id")
    .lean();
};

const migrateBookCreatedBy = async () => {
  await connectDatabase();

  const legacyBooks = await Book.collection
    .find({ createdBy: { $type: "string" } })
    .project({ _id: 1, createdBy: 1 })
    .toArray();

  let migrated = 0;
  const unresolved: { bookId: string; createdBy: string }[] = [];

  for (const book of legacyBooks) {
    const legacyValue = String(book.createdBy || "").trim();

    if (!legacyValue) {
      unresolved.push({ bookId: String(book._id), createdBy: legacyValue });
      continue;
    }

    const user = await findUserForLegacyValue(legacyValue);

    if (!user?._id) {
      unresolved.push({ bookId: String(book._id), createdBy: legacyValue });
      continue;
    }

    await Book.collection.updateOne(
      { _id: book._id },
      { $set: { createdBy: user._id } }
    );
    migrated += 1;
  }

  console.log(`Legacy createdBy records found: ${legacyBooks.length}`);
  console.log(`Migrated to ObjectId: ${migrated}`);

  if (unresolved.length > 0) {
    console.log("Unresolved records:");
    unresolved.forEach((item) => {
      console.log(`- ${item.bookId}: ${item.createdBy || "(empty)"}`);
    });
  }

  await disconnect();
};

migrateBookCreatedBy().catch(async (error: Error) => {
  console.error("Migration failed:", error.message);
  await disconnect();
  process.exitCode = 1;
});
