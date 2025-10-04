const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  sequence: [{ 
    step: Number, 
    approverRole: String 
  }],
  percentageRule: Number,
  specificApproverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hybrid: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);