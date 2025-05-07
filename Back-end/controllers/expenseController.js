import Book from "../modules/modul.js";
import ExpenseSchema from "../modules/ExpenseSchema.js";

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
  const { expense_amount, description } = req.body;

  try {
    const expense = new ExpenseSchema({
      expense_amount,
      description,
      firstbalance,
      balance,
      createdAt,
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await ExpenseSchema.find();
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { expense_amount, description } = req.body;

  try {
    const updatedExpense = await ExpenseSchema.findByIdAndUpdate(
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
    const deletedExpense = await ExpenseSchema.findByIdAndDelete(id);

    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
