const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware - Request URL:', req.url);
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'exists' : 'missing');
    
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'Access denied' });
    }

    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id).populate('companyId');
    if (!user) {
      console.log('User not found for ID:', decoded.id);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('User found:', user.name, user.email, user.role);
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth error:', error.message);
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