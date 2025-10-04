const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  sequence: [{ 
    step: Number, 
    approverRole: String,
    required: { type: Boolean, default: true }
  }],
  percentageRule: { type: Number, min: 1, max: 100 },
  specificApproverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hybrid: { type: Boolean, default: false },
  amountThreshold: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);