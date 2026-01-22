"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(authService, authRepository) {
        this.authService = authService;
        this.authRepository = authRepository;
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const credentials = req.body;
                // Validate input
                if (!credentials.password) {
                    res.status(400).json({ message: 'Password is required' });
                    return;
                }
                if (!credentials.email && !credentials.username) {
                    res.status(400).json({ message: 'Email or username is required' });
                    return;
                }
                console.log('Login attempt with:', { email: credentials.email, username: credentials.username });
                const result = yield this.authService.login(credentials);
                // Set refresh token in httpOnly cookie (optional but recommended)
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });
                res.status(200).json({
                    message: 'Login successful',
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: result.user,
                });
            }
            catch (error) {
                console.error('Login error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(401).json({ message: errorMessage });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken: token } = req.body;
                if (!token) {
                    res.status(400).json({ message: 'Refresh token is required' });
                    return;
                }
                const result = yield this.authService.refreshAccessToken(token);
                res.status(200).json({
                    message: 'Token refreshed successfully',
                    accessToken: result.accessToken,
                });
            }
            catch (error) {
                console.error('Refresh token error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(401).json({ message: errorMessage });
            }
        });
    }
    verifyToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(400).json({ message: 'Authorization header with Bearer token is required' });
                    return;
                }
                const token = authHeader.substring(7); // Remove 'Bearer ' prefix
                const decoded = yield this.authService.verifyAccessToken(token);
                res.status(200).json({
                    message: 'Token is valid',
                    user: decoded,
                });
            }
            catch (error) {
                console.error('Token verification error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(401).json({ message: errorMessage });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Clear refresh token cookie
                res.clearCookie('refreshToken');
                res.status(200).json({
                    message: 'Logout successful',
                });
            }
            catch (error) {
                console.error('Logout error:', error);
                res.status(500).json({ message: 'Internal Server Error' });
            }
        });
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signupData = req.body;
                // Validate input
                if (!signupData.email || !signupData.username || !signupData.name || !signupData.password || !signupData.role) {
                    res.status(400).json({ message: 'All fields are required' });
                    return;
                }
                if (signupData.password !== signupData.confirmPassword) {
                    res.status(400).json({ message: 'Passwords do not match' });
                    return;
                }
                if (signupData.password.length < 6) {
                    res.status(400).json({ message: 'Password must be at least 6 characters long' });
                    return;
                }
                console.log('Signup attempt with:', { email: signupData.email, username: signupData.username });
                const result = yield this.authService.signup(signupData);
                // Set refresh token in httpOnly cookie
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });
                res.status(201).json({
                    message: 'Signup successful',
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                    user: result.user,
                });
            }
            catch (error) {
                console.error('Signup error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                const statusCode = errorMessage.includes('already exists') ? 409 : 400;
                res.status(statusCode).json({ message: errorMessage });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                const { newPassword, confirmPassword, email } = req.body;
                if (!newPassword || !confirmPassword) {
                    res.status(400).json({ message: 'New password and confirmation are required' });
                    return;
                }
                let userId = null;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    const token = authHeader.substring(7);
                    const decoded = yield this.authService.verifyAccessToken(token);
                    userId = decoded.id;
                }
                else if (email) {
                    const user = yield this.authRepository.getUserByEmail(email);
                    if (!user) {
                        res.status(400).json({ message: 'User with provided email not found' });
                        return;
                    }
                    userId = user.id;
                }
                else {
                    res.status(400).json({ message: 'Authorization token or email is required to reset password' });
                    return;
                }
                yield this.authService.resetPassword(userId, newPassword, confirmPassword);
                res.status(200).json({ message: 'Password reset successfully' });
            }
            catch (error) {
                console.error('Reset password error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(400).json({ message: errorMessage });
            }
        });
    }
}
exports.AuthController = AuthController;
