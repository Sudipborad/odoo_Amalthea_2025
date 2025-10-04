const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function checkUserCompany() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findById('68e0b8da1f6ee6581ee9465d').populate('companyId');
    if (user) {
      console.log('User:', user.name, user.email, user.role);
      console.log('CompanyId:', user.companyId);
    } else {
      console.log('User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserCompany();