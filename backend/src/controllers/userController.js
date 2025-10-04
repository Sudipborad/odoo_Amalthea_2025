const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;
    
    const user = new User({
      name,
      email,
      password,
      role,
      companyId: req.user.companyId._id,
      managerId
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
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
    );
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
    );
    res.json({ message: 'Manager assigned successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createUser, updateUserRole, assignManager };