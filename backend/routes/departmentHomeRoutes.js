import express from 'express';
import { getDepartmentHome, updateDepartmentHome } from '../controllers/departmentHomeController.js';

const router = express.Router();

router.get('/:deptCode', getDepartmentHome);
router.put('/:deptCode', updateDepartmentHome);

export default router;
