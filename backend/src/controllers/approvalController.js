const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const ApprovalService = require('../services/approvalService');

const processApproval = async (req, res) => {
  try {
    const { decision, comments } = req.body;
    const expense = await Expense.findById(req.params.expenseId);
    
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    const approval = expense.approvals.find(
      a => a.approverId.toString() === req.user._id.toString()
    );
    
    if (!approval) return res.status(403).json({ error: 'Not authorized to approve this expense' });

    approval.decision = decision;
    approval.comments = comments;
    approval.decisionDate = new Date();

    const newStatus = await ApprovalService.checkApprovalStatus(expense);
    expense.status = newStatus;

    await expense.save();
    res.json({ message: 'Approval processed successfully', expense });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    const expenses = await Expense.find({
      companyId: req.user.companyId._id,
      'approvals.approverId': req.user._id,
      'approvals.decision': 'Pending'
    }).populate('employeeId', 'name email');
    
    res.json(expenses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createApprovalRule = async (req, res) => {
  try {
    const rule = new ApprovalRule({
      ...req.body,
      companyId: req.user.companyId._id
    });
    await rule.save();
    res.status(201).json({ message: 'Approval rule created successfully', rule });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getApprovalRules = async (req, res) => {
  try {
    const rules = await ApprovalRule.find({ companyId: req.user.companyId._id });
    res.json(rules);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const overrideApproval = async (req, res) => {
  try {
    const { status } = req.body;
    const expense = await Expense.findByIdAndUpdate(
      req.params.expenseId,
      { status },
      { new: true }
    );
    res.json({ message: 'Approval overridden successfully', expense });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { 
  processApproval, 
  getPendingApprovals, 
  createApprovalRule, 
  getApprovalRules,
  overrideApproval 
};