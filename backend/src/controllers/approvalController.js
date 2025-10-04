const Expense = require('../models/Expense');
const ApprovalRule = require('../models/ApprovalRule');
const ApprovalWorkflowService = require('../services/approvalWorkflowService');

const processApproval = async (req, res) => {
  try {
    const { decision, comments } = req.body;
    
    // First, let's check if the expense exists and has the right structure
    const expense = await Expense.findById(req.params.expenseId).populate('employeeId', 'name email');
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    console.log('Processing approval for expense:', expense._id);
    console.log('Current approvals:', expense.approvals);
    console.log('User trying to approve:', req.user._id, req.user.name);
    
    // If no approvals exist, create a simple one for this manager
    if (!expense.approvals || expense.approvals.length === 0) {
      expense.approvals = [{
        approverId: req.user._id,
        decision: 'Pending'
      }];
      await expense.save();
    }
    
    const processedExpense = await ApprovalWorkflowService.processApprovalDecision(
      req.params.expenseId,
      req.user._id,
      decision,
      comments
    );
    
    res.json({ message: 'Approval processed successfully', expense: processedExpense });
  } catch (error) {
    console.error('Approval processing error:', error);
    res.status(400).json({ error: error.message });
  }
};

const getPendingApprovals = async (req, res) => {
  try {
    console.log('User requesting approvals:', req.user.name, req.user._id);
    const companyId = req.user.companyId._id || req.user.companyId;
    
    // Find all expenses with pending status from same company only
    const allPendingExpenses = await Expense.find({ 
      status: 'Pending',
      companyId 
    }).populate('employeeId', 'name email');
    
    console.log('All pending expenses:', allPendingExpenses.length);
    
    // Role-based approval access
    let userApprovals = [];
    
    if (req.user.role === 'CFO') {
      // CFO sees ALL pending expenses in the company
      userApprovals = allPendingExpenses;
      
      // Ensure each expense has an approval record for CFO if not exists
      for (const expense of userApprovals) {
        const hasApproval = expense.approvals.some(approval => 
          approval.approverId.toString() === req.user._id.toString()
        );
        
        if (!hasApproval) {
          expense.approvals.push({
            approverId: req.user._id,
            decision: 'Pending'
          });
          await expense.save();
        }
      }
    } else if (req.user.role === 'Manager') {
      // Get team members
      const User = require('../models/User');
      const teamMembers = await User.find({ 
        managerId: req.user._id,
        companyId 
      });
      const teamMemberIds = teamMembers.map(member => member._id.toString());
      
      // Filter expenses from team members
      userApprovals = allPendingExpenses.filter(expense => 
        teamMemberIds.includes(expense.employeeId._id.toString())
      );
      
      // Ensure each expense has an approval record for this manager
      for (const expense of userApprovals) {
        if (!expense.approvals || expense.approvals.length === 0) {
          expense.approvals = [{
            approverId: req.user._id,
            decision: 'Pending'
          }];
          await expense.save();
        }
      }
    } else {
      // For other roles (Finance, Director, Admin), filter by existing approval records
      userApprovals = allPendingExpenses.filter(expense => 
        expense.approvals.some(approval => 
          approval.approverId.toString() === req.user._id.toString() && 
          approval.decision === 'Pending'
        )
      );
    }
    
    console.log('User approvals found:', userApprovals.length);
    res.json(userApprovals);
  } catch (error) {
    console.error('Approval error:', error);
    res.status(400).json({ error: error.message });
  }
};

const createApprovalRule = async (req, res) => {
  try {
    const ruleData = {
      ...req.body,
      companyId: req.user.companyId._id
    };
    
    // Remove empty specificApproverId
    if (!ruleData.specificApproverId || ruleData.specificApproverId === '') {
      delete ruleData.specificApproverId;
    }
    
    const rule = new ApprovalRule(ruleData);
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

const deleteApprovalRule = async (req, res) => {
  try {
    await ApprovalRule.findByIdAndDelete(req.params.ruleId);
    res.json({ message: 'Approval rule deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { 
  processApproval, 
  getPendingApprovals, 
  createApprovalRule, 
  getApprovalRules,
  deleteApprovalRule,
  overrideApproval 
};