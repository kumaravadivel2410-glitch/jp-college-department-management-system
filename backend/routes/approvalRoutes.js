import express from 'express';
import { getApprovals, updateApprovalStatus } from '../controllers/approvalController.js';

const router = express.Router();

router.get('/', getApprovals);
router.put('/:id', updateApprovalStatus);

export default router;
