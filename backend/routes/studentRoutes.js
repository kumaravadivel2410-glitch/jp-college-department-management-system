import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent, promoteStudents } from '../controllers/studentController.js';

const router = express.Router();

router.get('/', getStudents);
router.post('/', createStudent);
router.post('/promote', promoteStudents);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

export default router;
