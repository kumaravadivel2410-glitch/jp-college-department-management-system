import express from 'express';
import {
  getAttendance,
  getStudentsForAttendance,
  saveBatchAttendance,
  bulkDeleteAttendance,
  getAttendanceAnalytics
} from '../controllers/attendanceController.js';

const router = express.Router();

router.get('/', getAttendance);
router.get('/students', getStudentsForAttendance);
router.get('/analytics', getAttendanceAnalytics);
router.post('/batch', saveBatchAttendance);
router.post('/bulk-delete', bulkDeleteAttendance);

export default router;
