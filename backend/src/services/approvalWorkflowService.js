const ApprovalRule = require('../models/ApprovalRule');
const User = require('../models/User');
const Expense = require('../models/Expense');

class ApprovalWorkflowService {
  static async processExpenseApproval(expense) {
    const rules = await ApprovalRule.findOne({ companyId: expense.companyId });
    if (!rules) return this.defaultApproval(expense);

    // Initialize approval sequence
    const approvals = [];
    for (const step of rules.sequence) {
      const approvers = await User.find({ 
        companyId: expense.companyId, 
        role: step.approverRole 
      });
      
      approvals.push({
        approverId: approvers[0]?._id,
        decision: 'Pending',
        step: step.step
      });
    }
    
    expense.approvals = approvals;
    return expense.save();
  }

  static async processApprovalDecision(expenseId, approverId, decision, comments) {
    const expense = await Expense.findById(expenseId).populate('approvals.approverId');
    const rules = await ApprovalRule.findOne({ companyId: expense.companyId });
    
    // Find current approval step
    const currentApproval = expense.approvals.find(
      a => a.approverId.toString() === approverId && a.decision === 'Pending'
    );
    
    if (!currentApproval) throw new Error('No pending approval found');
    
    // Update current step
    currentApproval.decision = decision;
    currentApproval.comments = comments;
    currentApproval.decisionDate = new Date();
    
    if (decision === 'Rejected') {
      expense.status = 'Rejected';
    } else {
      // Check if all required approvals are complete
      const pendingApprovals = expense.approvals.filter(a => a.decision === 'Pending');
      if (pendingApprovals.length === 0) {
        expense.status = 'Approved';
      }
    }
    
    return expense.save();
  }

  static async defaultApproval(expense) {
    const manager = await User.findOne({ 
      companyId: expense.companyId, 
      role: 'Manager' 
    });
    
    expense.approvals = [{
      approverId: manager?._id,
      decision: 'Pending'
    }];
    
    return expense.save();
  }
}

module.exports = ApprovalWorkflowService;