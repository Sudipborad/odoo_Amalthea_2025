const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function assignManager() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const manager = await User.findOne({ role: 'Manager' });
    const employee = await User.findOne({ role: 'Employee' });
    
    if (manager && employee) {
      employee.managerId = manager._id;
      await employee.save();
      console.log(`Assigned ${employee.name} to manager ${manager.name}`);
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

assignManager();