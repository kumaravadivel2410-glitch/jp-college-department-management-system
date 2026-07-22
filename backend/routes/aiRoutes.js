const express = require('express');
const router = express.Router();
const aiControllers = require('../controllers/aiControllers');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/train', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), aiControllers.trainModel);
router.post('/retrain', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), aiControllers.trainModel);
router.get('/predict/student', verifyToken, aiControllers.predictStudents);
router.get('/predict/attendance', verifyToken, aiControllers.predictAttendance);
router.get('/analytics', verifyToken, aiControllers.getAnalytics);
router.get('/models', verifyToken, aiControllers.getModels);
router.post('/models/:id/activate', verifyToken, authorizeRoles('admin', 'super_admin'), aiControllers.activateModel);
router.get('/logs', verifyToken, authorizeRoles('admin', 'super_admin', 'faculty'), aiControllers.getTrainingLogs);

module.exports = router;
