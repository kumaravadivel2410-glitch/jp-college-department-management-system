import express from 'express';
import { getTimetable, createTimetableSlot, deleteTimetableSlot } from '../controllers/timetableController.js';

const router = express.Router();

router.get('/', getTimetable);
router.post('/', createTimetableSlot);
router.delete('/:id', deleteTimetableSlot);

export default router;
