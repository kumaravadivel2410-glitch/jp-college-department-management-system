import express from 'express';
import {
  getDownloads,
  getHistory,
  getSettings,
  updateSettings,
  createBackup,
  restoreBackup,
  importData,
  exportData
} from '../controllers/systemController.js';

const router = express.Router();

router.get('/downloads', getDownloads);
router.get('/history', getHistory);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

router.post('/backup', createBackup);
router.post('/restore', restoreBackup);

router.post('/import', importData);
router.get('/export', exportData);

export default router;
