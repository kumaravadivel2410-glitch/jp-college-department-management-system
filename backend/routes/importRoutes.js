const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const importControllers = require('../controllers/importControllers');
const { verifyToken, authorizeRoles, enforceFacultyAcademicScope } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

const allowedRoles = authorizeRoles('admin', 'super_admin', 'faculty');

// Preview & Row Validation Endpoint
router.post('/preview/:module', verifyToken, allowedRoles, enforceFacultyAcademicScope, upload.single('file'), importControllers.previewImportFile);

// Download Reports Endpoints
router.get('/report/:importId/error', verifyToken, importControllers.downloadErrorReport);
router.get('/report/:importId/success', verifyToken, importControllers.downloadSuccessReport);

// Modular Independent Import Routes
const modules = [
  'students', 'faculty', 'departments', 'subjects', 'classes',
  'attendance', 'internalmarks', 'semestermarks', 'notes',
  'assignments', 'timetable', 'notifications'
];

modules.forEach(mod => {
  router.post(`/${mod}`, verifyToken, allowedRoles, enforceFacultyAcademicScope, upload.single('file'), (req, res, next) => {
    req.params.module = mod;
    next();
  }, importControllers.executeModuleImport);
});

// Fallback generic modular import route
router.post('/:module', verifyToken, allowedRoles, enforceFacultyAcademicScope, upload.single('file'), importControllers.executeModuleImport);

module.exports = router;
