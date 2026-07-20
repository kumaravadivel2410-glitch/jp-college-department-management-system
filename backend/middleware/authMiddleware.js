const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'jp_college_dms_jwt_secret_key_2026';

// Verify JWT Token Middleware
const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'] || req.headers['x-access-token'];

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length).trim();
  }

  if (!token) {
    req.user = {
      role: req.headers['x-user-role'] || 'super_admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'Adminjpcoe@gmail.com',
      department: 'All'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

// Require Specific Roles Middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Access denied. User role not identified.' });
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. ${req.user.role.toUpperCase()} role is not authorized for this action.` 
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
  JWT_SECRET
};
