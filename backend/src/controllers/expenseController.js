const Expense = require('../models/Expense');
const CurrencyService = require('../services/currencyService');
const ApprovalWorkflowService = require('../services/approvalWorkflowService');

const submitExpense = async (req, res) => {
  try {
    const { originalAmount, originalCurrency, category, description, date, employeeId } = req.body;
    
    const convertedAmount = await CurrencyService.convertCurrency(
      originalCurrency,
      req.user.companyId.currency,
      originalAmount
    );

    // Allow managers/admins to submit on behalf of team members
    const targetEmployeeId = employeeId || req.user._id;
    
    // Verify manager can submit for this employee
    if (employeeId && req.user.role === 'Manager') {
      const User = require('../models/User');
      const employee = await User.findById(employeeId);
      if (!employee || employee.managerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Cannot submit expense for this employee' });
      }
    }

    const expense = new Expense({
      employeeId: targetEmployeeId,
      companyId: req.user.companyId._id,
      originalAmount,
      originalCurrency,
      convertedAmount,
      category,
      description,
      date: new Date(date),
      receiptUrl: req.file?.path,
      submittedBy: req.user._id
    });

    await ApprovalWorkflowService.processExpenseApproval(expense);

    res.status(201).json({ message: 'Expense submitted successfully', expense });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyExpenses = async (req, res) => {
  try {
    console.log('getMyExpenses - User ID:', req.user._id);
    console.log('getMyExpenses - User:', req.user.name, req.user.email);
    
    const expenses = await Expense.find({ employeeId: req.user._id })
      .populate('approvals.approverId', 'name email role')
      .sort({ createdAt: -1 });
    
    console.log('Found expenses:', expenses.length);
    res.json(expenses);
  } catch (error) {
    console.error('getMyExpenses error:', error);
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

const getTeamExpenses = async (req, res) => {
  try {
    const User = require('../models/User');
    const companyId = req.user.companyId._id || req.user.companyId;
    
    if (req.user.role === 'Admin') {
      // Admin sees only their company expenses
      const expenses = await Expense.find({ companyId })
        .populate('employeeId', 'name email')
        .populate('approvals.approverId', 'name email role')
        .sort({ createdAt: -1 });
      return res.json(expenses);
    }
    
    // For managers, find only their direct team members
    const teamMembers = await User.find({ managerId: req.user._id });
    
    if (teamMembers.length === 0) {
      // If no direct reports, return empty array
      return res.json([]);
    }
    
    const teamMemberIds = teamMembers.map(member => member._id);
    const expenses = await Expense.find({ 
      employeeId: { $in: teamMemberIds },
      companyId 
    })
      .populate('employeeId', 'name email')
      .populate('approvals.approverId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { submitExpense, getMyExpenses, getAllExpenses, getTeamExpenses };