import Expense from "../modules/Expense.js"; // таны folder нэр modules

const VALID_BUSINESS = new Set(["PICSHOT", "PICO_KIDS", "GROCERIES"]);
const VALID_PAYMENTS = new Set(["CASH", "ACCOUNT", "QPAY"]);

function isValidDateString(d) {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

// GET /expense (filters)
export const listExpenses = async (req, res) => {
  try {
    const { businessType, date, dateFrom, dateTo, category } = req.query;
    const filter: Record<string, any> = {};

    if (businessType && VALID_BUSINESS.has(businessType))
      filter.businessType = businessType;
    if (category) filter.expenseCategory = category;
    if (date && isValidDateString(date)) {
      filter.date = date;
    } else if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom && isValidDateString(dateFrom)) filter.date.$gte = dateFrom;
      if (dateTo && isValidDateString(dateTo)) filter.date.$lte = dateTo;
      if (Object.keys(filter.date).length === 0) delete filter.date;
    }

    const items = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    return res.json({ ok: true, items });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

// POST /expense
export const createExpense = async (req, res) => {
  try {
    const {
      businessType,
      expenseCategory,
      amount,
      paymentType,
      date,
      description = "",
      supplier = "",
    } = req.body;

    if (!VALID_BUSINESS.has(businessType))
      return res.status(400).json({ ok: false, message: "businessType буруу" });
    if (!expenseCategory)
      return res
        .status(400)
        .json({ ok: false, message: "expenseCategory хэрэгтэй" });

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 0)
      return res.status(400).json({ ok: false, message: "amount буруу" });

    if (!VALID_PAYMENTS.has(paymentType))
      return res.status(400).json({ ok: false, message: "paymentType буруу" });
    if (businessType === "PICO_KIDS" && !supplier) {
      return res
        .status(400)
        .json({ message: "Supplier required for Pico Kids" });
    }
    if (!isValidDateString(date))
      return res
        .status(400)
        .json({ ok: false, message: "date формат буруу (YYYY-MM-DD)" });

    const doc = await Expense.create({
      businessType,
      expenseCategory,
      amount: numAmount,
      paymentType,
      date,
      description,
      supplier: businessType === "PICO_KIDS" ? supplier : "",
    });

    return res.status(201).json({ ok: true, expense: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

// ✅ PUT /expense/:id  (EDIT)
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body || {};

    if (patch.businessType && !VALID_BUSINESS.has(patch.businessType)) {
      return res.status(400).json({ ok: false, message: "businessType буруу" });
    }
    if (patch.paymentType && !VALID_PAYMENTS.has(patch.paymentType)) {
      return res.status(400).json({ ok: false, message: "paymentType буруу" });
    }
    if (patch.date && !isValidDateString(patch.date)) {
      return res
        .status(400)
        .json({ ok: false, message: "date формат буруу (YYYY-MM-DD)" });
    }
    if (patch.amount !== undefined) {
      const n = Number(patch.amount);
      if (!Number.isFinite(n) || n < 0)
        return res.status(400).json({ ok: false, message: "amount буруу" });
      patch.amount = n;
    }

    // supplier зөвхөн Pico Kids дээр үлдээнэ
    if (patch.businessType && patch.businessType !== "PICO_KIDS")
      patch.supplier = "";

    const updated = await Expense.findByIdAndUpdate(id, patch, { new: true });
    if (!updated)
      return res.status(404).json({ ok: false, message: "Олдсонгүй" });

    return res.json({ ok: true, expense: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

// ✅ DELETE /expense/:id  (DELETE)
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ ok: false, message: "Олдсонгүй" });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};
