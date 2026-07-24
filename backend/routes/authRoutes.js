import express from 'express';
import { loginUser, registerUser, logoutUser, getMe, changePassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/change-password', changePassword);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export default router;
