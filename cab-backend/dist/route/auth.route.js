"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const router = express_1.default.Router();
router.post('/login', auth_controller_1.login);
router.post('/signup', auth_controller_1.signup);
router.post('/refresh-token', auth_controller_1.refreshToken);
router.post('/verify-token', auth_controller_1.verifyToken);
router.post('/reset-password', auth_controller_1.resetPassword);
router.post('/logout', auth_controller_1.logout);
exports.default = router;
