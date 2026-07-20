const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controllers = require('../controllers/apiControllers');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

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

// Helper to mount CRUD routes
const mountCrud = (prefix, controller) => {
  router.get(`/${prefix}`, controller.getAll);
  router.post(`/${prefix}`, verifyToken, controller.create);
  router.put(`/${prefix}/:id`, verifyToken, controller.update);
  router.delete(`/${prefix}/:id`, verifyToken, controller.delete);
};

// Auth & Registration Routes
router.post('/auth/login', controllers.auth.login);
router.post('/auth/register', controllers.auth.register);
router.get('/auth/pending-categorized', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.auth.getPendingCategorized);
router.put('/auth/approve/:userId', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.auth.approveUser);
router.put('/auth/reject/:userId', verifyToken, authorizeRoles('admin', 'super_admin'), controllers.auth.rejectUser);

// Core CRUD Routes
mountCrud('students', controllers.students);
mountCrud('faculty', controllers.faculty);
mountCrud('departments', controllers.departments);
mountCrud('subjects', controllers.subjects);
mountCrud('classes', controllers.classes);
mountCrud('attendance', controllers.attendance);
mountCrud('semester-marks', controllers.semesterMarks);
mountCrud('internal-marks', controllers.internalMarks);
mountCrud('users', controllers.users);
mountCrud('history', controllers.history);
mountCrud('settings', controllers.settings);

// Assignments Routes
router.get('/assignments', controllers.assignments.getAll);
router.post('/assignments', verifyToken, controllers.assignments.create);
router.post('/assignments/:id/submit', verifyToken, controllers.assignments.submitAssignment);
router.delete('/assignments/:id', verifyToken, controllers.assignments.delete);

// Timetables Routes
router.get('/timetables', controllers.timetables.getAll);
router.post('/timetables', verifyToken, controllers.timetables.saveTimetable);

// Subject Notes Routes
router.get('/notes', controllers.notes.getAll);
router.post('/notes/upload', verifyToken, upload.single('file'), controllers.notes.upload);
router.delete('/notes/:id', verifyToken, controllers.notes.delete);

// Notifications & Reports
router.get('/notifications', controllers.notifications.getAll);
router.post('/notifications/read-all', controllers.notifications.markRead);

router.get('/reports', controllers.reports.getAll);
router.post('/reports/generate', verifyToken, controllers.reports.generate);

// Import & Export Data Routes
router.post('/import', verifyToken, controllers.importExport.importData);
router.get('/export', verifyToken, controllers.importExport.exportData);

// Stats Route
router.get('/stats', controllers.getStats);

module.exports = router;
