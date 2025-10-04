const mongoose = require('mongoose');
const Expense = require('./src/models/Expense');
const User = require('./src/models/User');
require('dotenv').config();

async function testApprovalQuery() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const manager = await User.findOne({ role: 'Manager' }).populate('companyId');
    console.log('Manager ID:', manager._id);
    console.log('Manager Company:', manager.companyId);
    
    console.log('\n=== Query Test ===');
    const expenses = await Expense.find({
      companyId: manager.companyId._id,
      status: 'Pending',
      'approvals.approverId': manager._id,
      'approvals.decision': 'Pending'
    }).populate('employeeId', 'name email');
    
    console.log('Found expenses:', expenses.length);
    expenses.forEach(exp => {
      console.log(`- ${exp.category} by ${exp.employeeId?.name}`);
      console.log('  Approvals:', exp.approvals);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

testApprovalQuery();