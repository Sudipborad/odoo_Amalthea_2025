const express = require('express');
const ExportService = require('../services/exportService');
const Expense = require('../models/Expense');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/expenses/csv', auth, authorize('Manager', 'Admin'), async (req, res) => {
  try {
    let query = { companyId: req.user.companyId._id };
    
    // Filter by user role
    if (req.user.role === 'Manager') {
      const User = require('../models/User');
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId: req.user.companyId._id 
      });
      const teamMemberIds = teamMembers.map(member => member._id);
      query.employeeId = { $in: teamMemberIds };
    }

    const expenses = await Expense.find(query)
      .populate('employeeId', 'name email')
      .sort({ createdAt: -1 });

    const formattedExpenses = ExportService.formatExpenseData(expenses);
    const csv = await ExportService.exportExpensesToCSV(formattedExpenses);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;