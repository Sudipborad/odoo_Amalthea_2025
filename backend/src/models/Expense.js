const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  originalAmount: { type: Number, required: true },
  originalCurrency: { type: String, required: true },
  convertedAmount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  receiptUrl: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  approvals: [{
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    decision: { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
    comments: String,
    decisionDate: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);