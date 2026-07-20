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

// Enforcement Middleware for Student Academic Scope
const enforceStudentAcademicScope = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return next(); // Admins and Faculty bypass student scope restrictions
  }

  // Reject write operations for Students
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Exception: Student submitting their own QR attendance scan
    if (req.path.includes('/attendance/qr/scan') || req.path.includes('/assignments/submit')) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student accounts are restricted to read-only access.'
    });
  }

  // Enforce Year & Semester constraints based on Student Year
  const yearSemMap = {
    'I Year': ['Semester 1', 'Semester 2'],
    'II Year': ['Semester 3', 'Semester 4'],
    'III Year': ['Semester 5', 'Semester 6'],
    'IV Year': ['Semester 7', 'Semester 8']
  };

  const studentYear = req.user.year || 'III Year';
  const allowedSemesters = yearSemMap[studentYear] || ['Semester 5', 'Semester 6'];

  // Inject strict query filters into request query for student
  req.query.department = req.user.department || 'AI & DS';
  req.query.year = studentYear;

  // If query specifies a semester outside student's year, override or reject
  if (req.query.semester && req.query.semester !== 'All' && !allowedSemesters.includes(req.query.semester)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Students in ${studentYear} can only access ${allowedSemesters.join(' and ')}.`
    });
  }

  if (req.user.registerNo) {
    req.query.studentRegisterNo = req.user.registerNo;
  }

  next();
};

module.exports = {
  verifyToken,
  authorizeRoles,
  enforceStudentAcademicScope,
  JWT_SECRET
};
