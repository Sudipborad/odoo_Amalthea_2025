const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

async function fixUserRole() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findById('68e0b8da1f6ee6581ee9465d');
    if (user) {
      console.log('Current user:', user.name, user.email, user.role);
      user.role = 'Admin';
      await user.save();
      console.log('Updated user role to Admin');
    } else {
      console.log('User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUserRole();