const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const CurrencyService = require('../services/currencyService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
  try {
    const { name, email, password, companyName, country } = req.body;

    // Create company first
    const company = new Company({
      name: companyName,
      country,
      currency: 'USD', // Default currency
      adminId: null
    });
    await company.save();

    // Create admin user
    const user = new User({
      name,
      email,
      password,
      role: 'Admin',
      companyId: company._id
    });
    await user.save();

    // Update company with admin ID
    company.adminId = user._id;
    await company.save();

    const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name, email, role: user.role },
      company: { id: company._id, name: companyName, country, currency: 'USD' }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('companyId');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email, role: user.role },
      company: user.companyId
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signup, login };