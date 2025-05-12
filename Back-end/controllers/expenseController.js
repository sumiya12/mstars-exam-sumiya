import Book from "../modules/modul.js";
import Expense from "../modules/ExpenseSchema.js";
import { created, getAllExpense } from "../services/expenseService.js";
import  axios from "axios";

export const getTotal = async (req, res) => {
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
  let prePay = 0;
  let postPay = 0;

  bookings.forEach((b) => {
    prePay += b.prePay || 0;
    postPay += b.postPay || 0;
  });
  const total = prePay + postPay;

  res.json({
    month,
    total: total.toLocaleString(),
    prePay: prePay.toLocaleString(),
    postPay: postPay.toLocaleString(),
  });
};


export const registerExpense = async (req, res) => {
  const { expense_amount, description, createdAt } = req.body;

  try {
    const currentMonth = createdAt.slice(0, 7); // "2025-05"

    // Сарын хамгийн сүүлийн expense-г авна
    const lastExpense = await Expense.findOne({
      createdAt: { $regex: `^${currentMonth}` },
    })
      .sort({ createdAt: -1 })
      .exec();

    let first_balance;

    if (lastExpense) {
      first_balance = lastExpense.balance;
    } else {
      // Энд таны орлого тооцдог API-г дуудаж байна
      const response = await axios.get(
        `http://localhost:3001/expense/get?month=${currentMonth}`
      );
      const totalStr = response.data?.total || "0";
      first_balance = parseInt(totalStr.replace(/,/g, ""), 10);
    }

    const balance = first_balance - expense_amount;

    const expenseData = {
      expense_amount,
      description,
      first_balance,
      balance,
      createdAt,
    };

    await created({ body: expenseData });

    res.status(200).json({
      success: true,
      data: expenseData,
      message: "Зарлага амжилттай бүртгэгдлээ.",
    });
  } catch (error) {
    console.error("registerExpense error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ExpenseController.js
export const getLatestExpense = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ message: "Month is required" });

  try {
    const latest = await Expense.findOne({
      createdAt: { $regex: `^${month}` },
    })
      .sort({ createdAt: -1 })
      .exec();

    res.json(latest || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMonthlyExpenses = async (req, res) => {
  const { month } = req.query;
  if (!month) return res.status(400).json({ message: "Month is required" });

  const startDate = new Date(`${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  try {
    const expenses = await Expense.find({
      createdAt: { $gte: startDate, $lt: endDate },
    }).sort({ createdAt: 1 }); // эхэлсэнээс нь дарааллаар
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { expense_amount, description } = req.body;

  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      { expense_amount, description },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedExpense = await Expense.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
