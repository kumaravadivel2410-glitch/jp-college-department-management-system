import express from 'express';
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  getNotes,
  createNote,
  deleteNote
} from '../controllers/contentController.js';

const router = express.Router();

router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.delete('/assignments/:id', deleteAssignment);

router.get('/notes', getNotes);
router.post('/notes', createNote);
router.delete('/notes/:id', deleteNote);

export default router;
