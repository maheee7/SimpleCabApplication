import express from 'express';
import { AuthController } from '../controller/auth.controller';
import { AuthService } from '../service/auth.service';
import { AuthRepository } from '../repository/auth.repository';

const router = express.Router();

// Instantiate controller with dependencies
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService, authRepository);

router.post('/login', (req, res) => authController.login(req, res));
router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/verify-token', (req, res) => authController.verifyToken(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
