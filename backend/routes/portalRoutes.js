import express from 'express';
import { getStudentPortalData, getFacultyPortalData } from '../controllers/portalController.js';

const router = express.Router();

router.get('/student/:registerNumber', getStudentPortalData);
router.get('/faculty/:facultyId', getFacultyPortalData);

export default router;
