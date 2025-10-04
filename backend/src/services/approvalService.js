const User = require('../models/User');
const ApprovalRule = require('../models/ApprovalRule');

class ApprovalService {
  static async initializeApprovals(expense) {
    const rule = await ApprovalRule.findOne({ companyId: expense.companyId });
    if (!rule) return;

    const approvers = [];
    for (const step of rule.sequence) {
      const users = await User.find({ 
        companyId: expense.companyId, 
        role: step.approverRole 
      });
      approvers.push(...users);
    }

    expense.approvals = approvers.map(approver => ({
      approverId: approver._id,
      decision: 'Pending'
    }));
  }

  static async checkApprovalStatus(expense) {
    const rule = await ApprovalRule.findOne({ companyId: expense.companyId });
    if (!rule) return 'Pending';

    // Check specific approver rule
    if (rule.specificApproverId) {
      const specificApproval = expense.approvals.find(
        a => a.approverId.toString() === rule.specificApproverId.toString()
      );
      if (specificApproval?.decision === 'Approved') return 'Approved';
      if (specificApproval?.decision === 'Rejected') return 'Rejected';
    }

    // Check percentage rule
    if (rule.percentageRule) {
      const totalApprovers = expense.approvals.length;
      const approvedCount = expense.approvals.filter(a => a.decision === 'Approved').length;
      const rejectedCount = expense.approvals.filter(a => a.decision === 'Rejected').length;
      
      const approvalPercentage = (approvedCount / totalApprovers) * 100;
      const rejectionPercentage = (rejectedCount / totalApprovers) * 100;
      
      if (approvalPercentage >= rule.percentageRule) return 'Approved';
      if (rejectionPercentage >= (100 - rule.percentageRule)) return 'Rejected';
    }

    return 'Pending';
  }
}

module.exports = ApprovalService;