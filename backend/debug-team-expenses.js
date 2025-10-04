const mongoose = require('mongoose');
const User = require('./src/models/User');
const Expense = require('./src/models/Expense');
require('dotenv').config();

async function debugTeamExpenses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('=== All Users ===');
    const users = await User.find({});
    users.forEach(user => {
      console.log(`${user.name} (${user.role}) - Manager: ${user.managerId || 'None'}`);
    });
    
    console.log('\n=== All Expenses ===');
    const expenses = await Expense.find({}).populate('employeeId', 'name role managerId');
    expenses.forEach(expense => {
      console.log(`${expense.employeeId?.name} - ${expense.category} - Manager: ${expense.employeeId?.managerId || 'None'}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

debugTeamExpenses();