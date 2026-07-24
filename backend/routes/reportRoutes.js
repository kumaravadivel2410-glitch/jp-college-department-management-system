import express from 'express';
import { getReports, generateReport } from '../controllers/reportController.js';

const router = express.Router();

router.get('/', getReports);
router.post('/', generateReport);

export default router;
