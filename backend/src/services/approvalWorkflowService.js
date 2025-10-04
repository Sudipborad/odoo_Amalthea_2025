const ApprovalRule = require('../models/ApprovalRule');
const User = require('../models/User');
const Expense = require('../models/Expense');
const NotificationService = require('./notificationService');

class ApprovalWorkflowService {
  static async processExpenseApproval(expense) {
    // Find all active rules for the company
    const allRules = await ApprovalRule.find({ 
      companyId: expense.companyId,
      active: true 
    }).sort({ amountThreshold: -1 }); // Highest threshold first
    
    // Select rule based on expense amount
    let rules = null;
    for (const rule of allRules) {
      if (expense.convertedAmount >= (rule.amountThreshold || 0)) {
        rules = rule;
        break;
      }
    }
    
    // If no rule matches, use the rule with lowest/no threshold
    if (!rules && allRules.length > 0) {
      rules = allRules[allRules.length - 1];
    }
    
    if (!rules) return this.defaultApproval(expense);
    
    console.log(`Applying rule: ${rules.name} for amount: ${expense.convertedAmount}`);

    // Get the employee to find their manager
    const employee = await User.findById(expense.employeeId);
    
    // Initialize approval sequence based on rules
    const approvals = [];
    for (const step of rules.sequence) {
      let approverId;
      
      if (step.approverRole === 'Manager' && employee.managerId) {
        approverId = employee.managerId;
      } else {
        const approvers = await User.find({ 
          companyId: expense.companyId, 
          role: step.approverRole 
        });
        approverId = approvers[0]?._id;
      }
      
      if (approverId) {
        approvals.push({
          approverId,
          decision: 'Pending',
          step: step.step,
          required: step.required !== false
        });
      }
    }
    
    // Store rule reference for processing decisions
    expense.approvalRuleId = rules._id;
    expense.approvals = approvals;
    return expense.save();
  }

  static async processApprovalDecision(expenseId, approverId, decision, comments) {
    const expense = await Expense.findById(expenseId).populate('approvals.approverId');
    const rule = await ApprovalRule.findById(expense.approvalRuleId);
    
    // Find current approval step
    let currentApproval = expense.approvals.find(
      a => a.approverId.toString() === approverId.toString() && a.decision === 'Pending'
    );
    
    if (!currentApproval) {
      expense.approvals.push({
        approverId: approverId,
        decision: 'Pending'
      });
      currentApproval = expense.approvals[expense.approvals.length - 1];
    }
    
    // Update current step
    currentApproval.decision = decision;
    currentApproval.comments = comments;
    currentApproval.decisionDate = new Date();
    
    if (decision === 'Rejected') {
      expense.status = 'Rejected';
      await expense.save();
    } else {
      // Apply rule logic
      const finalStatus = await this.evaluateApprovalRules(expense, rule);
      expense.status = finalStatus;
      await expense.save();
    }
    
    // Reload expense to get updated approvals
    const savedExpense = await Expense.findById(expenseId).populate('approvals.approverId', 'name email role');
    
    if (savedExpense.status === 'Approved' || savedExpense.status === 'Rejected') {
      await NotificationService.notifyExpenseStatusChange(savedExpense, savedExpense.status);
    }
    
    return savedExpense;
  }

  static async evaluateApprovalRules(expense, rule) {
    const User = require('../models/User');
    
    // Define hierarchy (higher number = higher authority)
    const hierarchy = {
      'Employee': 1,
      'Manager': 2, 
      'Finance': 3,
      'Director': 4,
      'CFO': 5,
      'Admin': 6
    };
    
    // Find highest level approver who approved
    let highestApprover = null;
    let highestLevel = 0;
    
    for (const approval of expense.approvals) {
      if (approval.decision === 'Approved') {
        const approver = await User.findById(approval.approverId);
        const level = hierarchy[approver?.role] || 0;
        if (level > highestLevel) {
          highestLevel = level;
          highestApprover = approver;
        }
      }
    }
    
    if (highestApprover) {
      // Auto-approve all lower hierarchy levels
      let hasUpdates = false;
      for (const approval of expense.approvals) {
        const approver = await User.findById(approval.approverId);
        const approverLevel = hierarchy[approver?.role] || 0;
        
        if (approverLevel < highestLevel && approval.decision === 'Pending') {
          approval.decision = 'Approved';
          approval.comments = `Auto-approved by ${highestApprover.role} hierarchy`;
          approval.decisionDate = new Date();
          hasUpdates = true;
        }
      }
      
      // Save the expense with updated approvals
      if (hasUpdates) {
        await expense.save();
      }
      
      // Only Admin/CFO approval shows as "Approved" to employee
      if (highestApprover.role === 'Admin' || highestApprover.role === 'CFO') {
        console.log(`✅ ${highestApprover.role} APPROVAL - Final approval`);
        return 'Approved';
      } else {
        console.log(`⏳ ${highestApprover.role} approved - Waiting for Admin/CFO`);
        return 'Pending';
      }
    }
    
    // Fallback to original logic if no approvals yet
    if (!rule) {
      const pendingApprovals = expense.approvals.filter(a => a.decision === 'Pending');
      return pendingApprovals.length === 0 ? 'Approved' : 'Pending';
    }
    
    const approvedCount = expense.approvals.filter(a => a.decision === 'Approved').length;
    const totalApprovers = expense.approvals.length;
    const approvalPercentage = (approvedCount / totalApprovers) * 100;
    
    // Check percentage rule
    if (rule.percentageRule && approvalPercentage >= rule.percentageRule) {
      console.log(`Approved by percentage rule: ${approvalPercentage}% >= ${rule.percentageRule}%`);
      return 'Approved';
    }
    
    console.log('Still pending approval');
    return 'Pending';
  }

  static async defaultApproval(expense) {
    // Get the employee to find their manager
    const employee = await User.findById(expense.employeeId);
    let approverId;
    
    if (employee.managerId) {
      // Use the employee's direct manager
      approverId = employee.managerId;
    } else {
      // Fallback to any manager in the company
      const manager = await User.findOne({ 
        companyId: expense.companyId, 
        role: 'Manager' 
      });
      approverId = manager?._id;
    }
    
    if (approverId) {
      expense.approvals = [{
        approverId,
        decision: 'Pending'
      }];
    }
    
    return expense.save();
  }
}

module.exports = ApprovalWorkflowService;