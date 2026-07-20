const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controllers = require('../controllers/apiControllers');
const { verifyToken, authorizeRoles, enforceStudentAcademicScope } = require('../middleware/authMiddleware');

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

// Helper to mount CRUD routes with Student Academic Scope Enforcement
const mountCrud = (prefix, controller) => {
  router.get(`/${prefix}`, verifyToken, enforceStudentAcademicScope, controller.getAll);
  router.post(`/${prefix}`, verifyToken, enforceStudentAcademicScope, controller.create);
  router.put(`/${prefix}/:id`, verifyToken, enforceStudentAcademicScope, controller.update);
  router.delete(`/${prefix}/:id`, verifyToken, enforceStudentAcademicScope, controller.delete);
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

// Import & Export Data Routes (Admin/Faculty Only)
router.post('/import', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), controllers.importExport.importData);
router.post('/import/file', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), controllers.importExport.importFile);
router.post('/import/students', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'students'; next(); }, controllers.importExport.importFile);
router.post('/import/faculty', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'faculty'; next(); }, controllers.importExport.importFile);
router.post('/import/attendance', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'attendance'; next(); }, controllers.importExport.importFile);
router.post('/import/internalmarks', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'internalMarks'; next(); }, controllers.importExport.importFile);
router.post('/import/semestermarks', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'semesterMarks'; next(); }, controllers.importExport.importFile);
router.post('/import/subjects', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'subjects'; next(); }, controllers.importExport.importFile);
router.post('/import/classes', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'classes'; next(); }, controllers.importExport.importFile);
router.post('/import/timetable', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'timetables'; next(); }, controllers.importExport.importFile);
router.post('/import/notes', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'notes'; next(); }, controllers.importExport.importFile);
router.post('/import/assignments', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), upload.single('file'), (req, res, next) => { req.body.target = 'assignments'; next(); }, controllers.importExport.importFile);
router.get('/export', verifyToken, controllers.importExport.exportData);

// Stats Route
router.get('/stats', controllers.getStats);

module.exports = router;
