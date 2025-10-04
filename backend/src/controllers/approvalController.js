const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const ApprovalWorkflowService = require('../services/approvalWorkflowService');

const processApproval = async (req, res) => {
  try {
    const { decision, comments } = req.body;
    const expense = await ApprovalWorkflowService.processApprovalDecision(
      req.params.expenseId,
      req.user._id,
      decision,
      comments
    );
    
    res.json({ message: 'Approval processed successfully', expense });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    console.log('User requesting approvals:', req.user.name, req.user._id);
    
    // Find all expenses with pending status
    const allPendingExpenses = await Expense.find({ status: 'Pending' })
      .populate('employeeId', 'name email');
    
    console.log('All pending expenses:', allPendingExpenses.length);
    
    // Filter for this user's approvals
    const userApprovals = allPendingExpenses.filter(expense => 
      expense.approvals.some(approval => 
        approval.approverId.toString() === req.user._id.toString() && 
        approval.decision === 'Pending'
      )
    );
    
    console.log('User approvals found:', userApprovals.length);
    res.json(userApprovals);
  } catch (error) {
    console.error('Approval error:', error);
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