import express from 'express';
import { login, signup, refreshToken, verifyToken, resetPassword, logout } from '../controller/auth.controller';

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/refresh-token', refreshToken);
router.post('/verify-token', verifyToken);
router.post('/reset-password', resetPassword);
router.post('/logout', logout);

export default router;
