const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('companyId');
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    console.log('Backend auth - User role:', user.role); // Debug log
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userRole = req.user.role;
    console.log('Backend authorize - Required roles:', roles, 'User role:', userRole); // Debug log
    
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Access forbidden. Required roles: ${roles.join(', ')}. Your role: ${userRole}` });
    }
    next();
  };
};

module.exports = { auth, authorize };