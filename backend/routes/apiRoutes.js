const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controllers = require('../controllers/apiControllers');
const { verifyToken, authorizeRoles, enforceStudentAcademicScope, enforceFacultyAcademicScope } = require('../middleware/authMiddleware');

// Configure Multer for secure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }
});

// Helper to mount CRUD routes with Role-Based Scope Enforcement
const mountCrud = (prefix, controller) => {
  router.get(`/${prefix}`, verifyToken, enforceFacultyAcademicScope, enforceStudentAcademicScope, controller.getAll);
  router.post(`/${prefix}`, verifyToken, enforceFacultyAcademicScope, enforceStudentAcademicScope, controller.create);
  router.put(`/${prefix}/:id`, verifyToken, enforceFacultyAcademicScope, enforceStudentAcademicScope, controller.update);
  router.delete(`/${prefix}/:id`, verifyToken, enforceFacultyAcademicScope, enforceStudentAcademicScope, controller.delete);
};

// Auth & Registration Routes
router.post('/auth/login', controllers.auth.login);
router.post('/auth/register', controllers.auth.register);
router.get('/auth/pending-categorized', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.auth.getPendingCategorized);
router.put('/auth/approve/:userId', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.auth.approveUser);
router.put('/auth/reject/:userId', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.auth.rejectUser);

// Core CRUD Routes with Student Scope Security
mountCrud('students', controllers.students);
router.post('/students/promote', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.promoteStudents);
mountCrud('faculty', controllers.faculty);
mountCrud('departments', controllers.departments);
mountCrud('subjects', controllers.subjects);
mountCrud('classes', controllers.classes);
mountCrud('attendance', controllers.attendance);
router.post('/attendance/batch', verifyToken, controllers.batchAttendance);
router.post('/attendance/qr/generate', verifyToken, controllers.generateQR);
router.post('/attendance/qr/scan', verifyToken, controllers.scanQR);
mountCrud('semester-marks', controllers.semesterMarks);
mountCrud('internal-marks', controllers.internalMarks);
mountCrud('marks', controllers.internalMarks);
mountCrud('users', controllers.users);
mountCrud('history', controllers.history);
mountCrud('settings', controllers.settings);

// Assignments Routes
router.get('/assignments', verifyToken, enforceStudentAcademicScope, controllers.assignments.getAll);
router.post('/assignments', verifyToken, enforceStudentAcademicScope, controllers.assignments.create);
router.post('/assignments/:id/submit', verifyToken, enforceStudentAcademicScope, controllers.assignments.submitAssignment);
router.delete('/assignments/:id', verifyToken, enforceStudentAcademicScope, controllers.assignments.delete);

// Timetables Routes
router.get('/timetables', verifyToken, enforceStudentAcademicScope, controllers.timetables.getAll);
router.post('/timetables', verifyToken, enforceStudentAcademicScope, controllers.timetables.saveTimetable);

// Subject Notes Routes
router.get('/notes', verifyToken, enforceStudentAcademicScope, controllers.notes.getAll);
router.post('/notes/upload', verifyToken, enforceStudentAcademicScope, upload.single('file'), controllers.notes.upload);
router.delete('/notes/:id', verifyToken, enforceStudentAcademicScope, controllers.notes.delete);

// Notifications & Reports
router.get('/notifications', verifyToken, enforceStudentAcademicScope, controllers.notifications.getAll);
router.post('/notifications/read-all', verifyToken, controllers.notifications.markRead);

router.get('/reports', verifyToken, enforceStudentAcademicScope, controllers.reports.getAll);
router.post('/reports/generate', verifyToken, controllers.reports.generate);

// Import & Export Data Routes (Modular Architecture)
const importRoutes = require('./importRoutes');
router.use('/import', importRoutes);
router.get('/export', verifyToken, controllers.importExport.exportData);

// Stats Route
router.get('/stats', controllers.getStats);

module.exports = router;
