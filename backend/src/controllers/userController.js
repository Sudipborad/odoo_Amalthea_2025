const User = require('../models/User');
const Company = require('../models/Company');

const getAllUsers = async (req, res) => {
  try {
    const companyId = req.user.companyId || req.user.companyId?._id;
    const users = await User.find({ companyId })
      .select('-password')
      .populate('managerId', 'name email');
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    
    let companyId = req.user.companyId || req.user.companyId?._id;
    
    // If user doesn't have a company, create a default one
    if (!companyId) {
      const company = new Company({
        name: 'Default Company',
        country: 'India',
        currency: 'INR',
        adminId: req.user._id
      });
      await company.save();
      companyId = company._id;
      
      // Update current user with companyId
      await User.findByIdAndUpdate(req.user._id, { companyId });
    }
    
    const userData = {
      name,
      email,
      password,
      role,
      companyId
    };
    
    // Only add managerId if it's not empty
    if (managerId && managerId.trim() !== '') {
      userData.managerId = managerId;
    }
    
    const user = new User(userData);

    await user.save();
    const userResponse = await User.findById(user._id).select('-password');
    res.status(201).json({ message: 'User created successfully', user: userResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    res.json({ message: 'Role updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const assignManager = async (req, res) => {
  try {
    const { managerId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { managerId },
      { new: true }
    ).select('-password');
    res.json({ message: 'Manager assigned successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createUser, updateUserRole, assignManager, getAllUsers };