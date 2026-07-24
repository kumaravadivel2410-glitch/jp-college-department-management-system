import express from 'express';
import {
  getInternalMarks,
  createInternalMark,
  updateInternalMark,
  deleteInternalMark,
  getSemesterMarks,
  createSemesterMark,
  updateSemesterMark,
  deleteSemesterMark
} from '../controllers/markController.js';

const router = express.Router();

// Internal Marks endpoints (support both /internalmarks and /internal-marks)
router.get(['/internalmarks', '/internal-marks'], getInternalMarks);
router.post(['/internalmarks', '/internal-marks'], createInternalMark);
router.put(['/internalmarks/:id', '/internal-marks/:id'], updateInternalMark);
router.delete(['/internalmarks/:id', '/internal-marks/:id'], deleteInternalMark);

// Semester Marks endpoints (support both /semestermarks and /semester-marks)
router.get(['/semestermarks', '/semester-marks'], getSemesterMarks);
router.post(['/semestermarks', '/semester-marks'], createSemesterMark);
router.put(['/semestermarks/:id', '/semester-marks/:id'], updateSemesterMark);
router.delete(['/semestermarks/:id', '/semester-marks/:id'], deleteSemesterMark);

export default router;
