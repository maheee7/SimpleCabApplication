"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const auth_service_1 = require("../service/auth.service");
const auth_repository_1 = require("../repository/auth.repository");
const router = express_1.default.Router();
// Instantiate controller with dependencies
const authRepository = new auth_repository_1.AuthRepository();
const authService = new auth_service_1.AuthService(authRepository);
const authController = new auth_controller_1.AuthController(authService, authRepository);
router.post('/login', (req, res) => authController.login(req, res));
router.post('/signup', (req, res) => authController.signup(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
router.post('/verify-token', (req, res) => authController.verifyToken(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
exports.default = router;
