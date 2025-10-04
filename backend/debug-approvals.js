const mongoose = require('mongoose');
const Expense = require('./src/models/Expense');
const User = require('./src/models/User');
require('dotenv').config();

async function debugApprovals() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== All Expenses ===');
    const expenses = await Expense.find({}).populate('employeeId approvals.approverId');
    expenses.forEach(expense => {
      console.log(`Expense: ${expense.category} by ${expense.employeeId?.name}`);
      console.log(`Status: ${expense.status}`);
      console.log('Approvals:', expense.approvals);
      console.log('---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugApprovals();