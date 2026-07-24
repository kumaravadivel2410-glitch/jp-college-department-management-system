import express from 'express';
import authRoutes from './authRoutes.js';
import studentRoutes from './studentRoutes.js';
import facultyRoutes from './facultyRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import departmentHomeRoutes from './departmentHomeRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import classRoutes from './classRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import markRoutes from './markRoutes.js';
import contentRoutes from './contentRoutes.js';
import timetableRoutes from './timetableRoutes.js';
import approvalRoutes from './approvalRoutes.js';
import reportRoutes from './reportRoutes.js';
import systemRoutes from './systemRoutes.js';
import portalRoutes from './portalRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/departments', departmentRoutes);
router.use('/department-home', departmentHomeRoutes);
router.use('/subjects', subjectRoutes);
router.use('/classes', classRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/portal', portalRoutes);
router.use('/', markRoutes);
router.use('/', contentRoutes);
router.use(['/timetable', '/timetables'], timetableRoutes);
router.use('/approvals', approvalRoutes);
router.use(['/reports', '/report'], reportRoutes);
router.use('/', systemRoutes);

export default router;
