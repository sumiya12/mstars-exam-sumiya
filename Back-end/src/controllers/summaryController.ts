import Book from "../models/Book.js";
import WareHouse from "../models/WarehouseItem.js";

const DEFAULT_PRICES = {
  paper: {
    A6: 2500,
    A5: 5000,
    A4: 10000,
    A3: 15000,
  },
  frame: {
    A5: 10000,
    A4: 15000,
    A3: 30000,
  },
};

const getDefaultPrice = (type: "paper" | "frame", size: string) =>
  DEFAULT_PRICES[type]?.[size] || 0;

const getPaymentAmount = (book, type: "Cash" | "Card" | "Account") => {
  const splitKey = type.toLowerCase();
  const splitAmount = Number(book.paymentBreakdown?.[splitKey] || 0);

  if (splitAmount > 0) return splitAmount;

  return book.paymenType === type ? (book.prePay || 0) + (book.postPay || 0) : 0;
};

export const getDailySummary = async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ message: "Date is required" });

  const shortDate = date.slice(5); // "10-21" гэх мэт
  const currentYear = date.slice(0, 4); // "2025"

  const bookings = await Book.find({
    year: currentYear,
    day: shortDate,
  });

  // Бүх төрлийн массив цуглуулах
  let giftPhotos = [];
  let additionalPhotos = [];
  let frameOnly = [];
  let frameAndPaper = [];
  let canvasList = [];

  bookings.forEach(
    ({
      pictures = [],
      paper = [],
      frame = [],
      frameAndPaper = [],
      canvas = [],
    }) => {
      giftPhotos.push(...pictures);
      additionalPhotos.push(...paper);
      frameOnly.push(...frame);
      frameAndPaper.push(...frameAndPaper);
      canvasList.push(...canvas);
    }
  );

  // 👇 Canvas amount
  const canvasAmount = canvasList.reduce((sum, c) => sum + (c.price || 0), 0);

  // 📦 unitPrice татах туслах функц
  const getUnitPrice = async (type, size) => {
    const item: any = await WareHouse.findOne({ type, size });
    return item?.price || getDefaultPrice(type, size);
  };

  // 👇 Price-based дүн бодох функц
  const calcTotalAmount = async (items, type) => {
    const prices = await Promise.all(
      items.map(async (item) => {
        const price = await getUnitPrice(type, item.size);
        return price * (item.count || 0);
      })
    );
    return prices.reduce((sum, p) => sum + p, 0);
  };

  // Breakdown size
  const summarizeBySize = (items) => {
    const summary = {};
    items.forEach(({ size, count }) => {
      if (!size) return;
      summary[size] = (summary[size] || 0) + (count || 0);
    });
    return summary;
  };
  const countBySize = (items) => {
    const summary = {};
    items.forEach(({ size }) => {
      if (!size) return;
      summary[size] = (summary[size] || 0) + 1;
    });
    return summary;
  };

  // 👇 Тооцоолол эхлэх
  const [giftPhotoAmount, paperAmount, frameOnlyAmount, frameAndPaperAmount] =
    await Promise.all([
      calcTotalAmount(giftPhotos, "paper"),
      calcTotalAmount(additionalPhotos, "paper"),
      calcTotalAmount(frameOnly, "frame"),
      (async () => {
        let sum = 0;
        for (const item of frameAndPaper) {
          const framePrice = await getUnitPrice("frame", item.size);
          const paperPrice = await getUnitPrice("paper", item.size);
          sum += (framePrice + paperPrice) * (item.count || 0);
        }
        return sum;
      })(),
    ]);

  // Нийт дүнгүүд
  const totalPhotos = giftPhotos
    .concat(additionalPhotos, frameAndPaper)
    .reduce((a, b) => a + (b.count || 0), 0);
  const totalFrames = frameOnly
    .concat(frameAndPaper)
    .reduce((a, b) => a + (b.count || 0), 0);

  // Төлбөрийн тооцоолол
  let prePay = 0;
  let postPay = 0;
  const paymentTypes = { Cash: 0, Card: 0, Account: 0 };

  bookings.forEach((b) => {
    prePay += b.prePay || 0;
    postPay += b.postPay || 0;

    paymentTypes.Cash += getPaymentAmount(b, "Cash");
    paymentTypes.Card += getPaymentAmount(b, "Card");
    paymentTypes.Account += getPaymentAmount(b, "Account");
  });

  const total = prePay + postPay;

  res.json({
    date,
    totalBookings: bookings.length,
    totalPhotos,
    totalFrames,
    canvas: canvasList.length,
    breakdown: {
      giftPhotosBySize: summarizeBySize(giftPhotos),
      additionalPhotosBySize: summarizeBySize(additionalPhotos),
      frameOnlyBySize: summarizeBySize(frameOnly),
      frameAndPaperBySize: summarizeBySize(frameAndPaper),
      canvasBySize: countBySize(canvasList),
    },
    amount: {
      giftPhotos: giftPhotoAmount,
      additionalPhotos: paperAmount,
      frameOnly: frameOnlyAmount,
      frameAndPaper: frameAndPaperAmount,
      canvas: canvasAmount,
      total,
      prePay,
      postPay,
    },
    paymentTypes,
  });
};
export const getPaymenTypeOfMonthly = async (req, res) => {
  try {
    const bookings = await Book.find({});

    // Group bookings by month like "2025-07"
    const grouped: Record<string, { card: number; cash: number; account: number }> = {};

    bookings.forEach((book) => {
        const { year, day, createdAt } = book;
        let monthKey = "";

        if (year && day) {
          const [month] = day.split("-");
          monthKey = `${year}-${month.padStart(2, "0")}`;
        } else {
          const date = new Date(createdAt);
          const y = date.getFullYear();
          const m = (date.getMonth() + 1).toString().padStart(2, "0");
          monthKey = `${y}-${m}`;
        }

        if (!grouped[monthKey])
          grouped[monthKey] = { card: 0, cash: 0, account: 0 };

        grouped[monthKey].card += getPaymentAmount(book, "Card");
        grouped[monthKey].cash += getPaymentAmount(book, "Cash");
        grouped[monthKey].account += getPaymentAmount(book, "Account");
      }
    );

    const result = Object.entries(grouped).map(([key, value]) => ({
      month: key, // e.g. "2025-07"
      ...value,
      sum: value.card + value.cash + value.account,
    }));

    res.json(result.sort((a, b) => a.month.localeCompare(b.month)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMonthlySummary = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ message: "Month is required" });

  const [yearStr, monthStr] = month.split("-");
  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  const bookings = await Book.find({
    $or: [
      { year: yearStr, day: { $regex: `^${monthStr}-` } }, // New bookings with year field
      {
        year: { $exists: false }, // Old bookings without year
        createdAt: { $gte: startDate, $lt: endDate }, // Fallback to createdAt
      },
    ],
  });

  // Initialize arrays
  let giftPhotos = [],
    additionalPhotos = [],
    frameOnly = [],
    frameAndPaper = [],
    canvasList = [];

  bookings.forEach(
    ({
      pictures = [],
      paper = [],
      frame = [],
      frameAndPaper = [],
      canvas = [],
    }) => {
      giftPhotos.push(...pictures);
      additionalPhotos.push(...paper);
      frameOnly.push(...frame);
      frameAndPaper.push(...frameAndPaper);
      canvasList.push(...canvas);
    }
  );

  // Price fetcher
  const getUnitPrice = async (type, size) => {
    const item: any = await WareHouse.findOne({ type, size });
    return item?.price || getDefaultPrice(type, size);
  };

  const calcTotalAmount = async (items, type) => {
    const prices = await Promise.all(
      items.map(async (item) => {
        const price = await getUnitPrice(type, item.size);
        return price * (item.count || 0);
      })
    );
    return prices.reduce((sum, p) => sum + p, 0);
  };

  const summarizeBySize = (items) => {
    const summary = {};
    items.forEach(({ size, count }) => {
      if (!size) return;
      summary[size] = (summary[size] || 0) + (count || 0);
    });
    return summary;
  };

  const countBySize = (items) => {
    const summary = {};
    items.forEach(({ size }) => {
      if (!size) return;
      summary[size] = (summary[size] || 0) + 1;
    });
    return summary;
  };

  // Calculations
  const [giftPhotoAmount, paperAmount, frameOnlyAmount, frameAndPaperAmount] =
    await Promise.all([
      calcTotalAmount(giftPhotos, "paper"),
      calcTotalAmount(additionalPhotos, "paper"),
      calcTotalAmount(frameOnly, "frame"),
      (async () => {
        let sum = 0;
        for (const item of frameAndPaper) {
          const framePrice = await getUnitPrice("frame", item.size);
          const paperPrice = await getUnitPrice("paper", item.size);
          sum += (framePrice + paperPrice) * (item.count || 0);
        }
        return sum;
      })(),
    ]);

  const canvasAmount = canvasList.reduce((sum, c) => sum + (c.price || 0), 0);
  const totalPhotos = giftPhotos
    .concat(additionalPhotos, frameAndPaper)
    .reduce((a, b) => a + (b.count || 0), 0);
  const totalFrames = frameOnly
    .concat(frameAndPaper)
    .reduce((a, b) => a + (b.count || 0), 0);

  let prePay = 0;
  let postPay = 0;
  const paymentSummary = {
    Cash: { count: 0, amount: 0 },
    Card: { count: 0, amount: 0 },
    Account: { count: 0, amount: 0 },
  };

  bookings.forEach((book) => {
    (["Cash", "Card", "Account"] as const).forEach((type) => {
      const amount = getPaymentAmount(book, type);
      if (amount > 0) {
        paymentSummary[type].count += 1;
        paymentSummary[type].amount += amount;
      }
    });
  });

  bookings.forEach((b) => {
    prePay += b.prePay || 0;
    postPay += b.postPay || 0;
  });

  const total = prePay + postPay;

  res.json({
    month,
    totalBookings: bookings.length,
    totalPhotos,
    totalFrames,
    canvas: canvasList.length,
    breakdown: {
      giftPhotosBySize: summarizeBySize(giftPhotos),
      additionalPhotosBySize: summarizeBySize(additionalPhotos),
      frameOnlyBySize: summarizeBySize(frameOnly),
      frameAndPaperBySize: summarizeBySize(frameAndPaper),
      canvasBySize: countBySize(canvasList),
    },
    amount: {
      giftPhotos: giftPhotoAmount,
      additionalPhotos: paperAmount,
      frameOnly: frameOnlyAmount,
      frameAndPaper: frameAndPaperAmount,
      canvas: canvasAmount,
      total,
      prePay,
      postPay,
    },
    paymentSummary,
  });
};
