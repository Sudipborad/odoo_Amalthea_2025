const Expense = require('../models/Expense');
const CurrencyService = require('../services/currencyService');
const ApprovalService = require('../services/approvalService');

const submitExpense = async (req, res) => {
  try {
    const { originalAmount, originalCurrency, category, description, date } = req.body;
    
    const convertedAmount = await CurrencyService.convertCurrency(
      originalCurrency,
      req.user.companyId.currency,
      originalAmount
    );

    const expense = new Expense({
      employeeId: req.user._id,
      companyId: req.user.companyId._id,
      originalAmount,
      originalCurrency,
      convertedAmount,
      category,
      description,
      date: new Date(date),
      receiptUrl: req.file?.path
    });

    await ApprovalService.initializeApprovals(expense);
    await expense.save();

    res.status(201).json({ message: 'Expense submitted successfully', expense });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id })
      .populate('approvals.approverId', 'name email')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ companyId: req.user.companyId._id })
      .populate('employeeId', 'name email')
      .populate('approvals.approverId', 'name email')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { submitExpense, getMyExpenses, getAllExpenses };