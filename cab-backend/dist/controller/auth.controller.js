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
                if (!credentials.password) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_PASSWORD', message: 'Password is required' }
                    });
                    return;
                }
                if (!credentials.email && !credentials.username) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_CREDENTIALS', message: 'Email or username is required' }
                    });
                    return;
                }
                const result = yield this.authService.login(credentials);
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(200).json({
                    status: 'success',
                    data: {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                        user: result.user,
                    },
                    message: 'Login successful'
                });
            }
            catch (error) {
                console.error('Login error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(401).json({
                    status: 'error',
                    errors: { code: 'UNAUTHORIZED', message: errorMessage }
                });
            }
        });
    }
    refreshToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const token = req.body.refreshToken || req.cookies.refreshToken;
                if (!token) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_TOKEN', message: 'Refresh token is required' }
                    });
                    return;
                }
                const result = yield this.authService.refreshAccessToken(token);
                res.status(200).json({
                    status: 'success',
                    data: { accessToken: result.accessToken },
                    message: 'Token refreshed successfully'
                });
            }
            catch (error) {
                console.error('Refresh token error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(401).json({
                    status: 'error',
                    errors: { code: 'UNAUTHORIZED', message: errorMessage }
                });
            }
        });
    }
    verifyToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_AUTH_HEADER', message: 'Authorization header with Bearer token is required' }
                    });
                    return;
                }
                const token = authHeader.substring(7);
                const decoded = yield this.authService.verifyAccessToken(token);
                res.status(200).json({
                    status: 'success',
                    data: { user: decoded },
                    message: 'Token is valid'
                });
            }
            catch (error) {
                console.error('Token verification error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(401).json({
                    status: 'error',
                    errors: { code: 'UNAUTHORIZED', message: errorMessage }
                });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie('refreshToken');
                res.status(200).json({
                    status: 'success',
                    message: 'Logout successful'
                });
            }
            catch (error) {
                console.error('Logout error:', error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    signup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signupData = req.body;
                if (!signupData.email || !signupData.username || !signupData.name || !signupData.password || !signupData.role) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'INCOMPLETE_DATA', message: 'All fields are required' }
                    });
                    return;
                }
                if (signupData.password !== signupData.confirmPassword) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'PASSWORD_MISMATCH', message: 'Passwords do not match' }
                    });
                    return;
                }
                const result = yield this.authService.signup(signupData);
                res.cookie('refreshToken', result.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(201).json({
                    status: 'success',
                    data: {
                        accessToken: result.accessToken,
                        refreshToken: result.refreshToken,
                        user: result.user,
                    },
                    message: 'Signup successful'
                });
            }
            catch (error) {
                console.error('Signup error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                const statusCode = errorMessage.includes('already exists') ? 409 : 400;
                res.status(statusCode).json({
                    status: 'error',
                    errors: { code: statusCode === 409 ? 'USER_EXISTS' : 'SIGNUP_FAILED', message: errorMessage }
                });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers.authorization;
                const { newPassword, confirmPassword, email } = req.body;
                if (!newPassword || !confirmPassword) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_PASSWORD', message: 'New password and confirmation are required' }
                    });
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
                        res.status(400).json({
                            status: 'error',
                            errors: { code: 'USER_NOT_FOUND', message: 'User with provided email not found' }
                        });
                        return;
                    }
                    userId = user.id;
                }
                else {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_IDENTIFIER', message: 'Authorization token or email is required' }
                    });
                    return;
                }
                yield this.authService.resetPassword(userId, newPassword, confirmPassword);
                res.status(200).json({
                    status: 'success',
                    message: 'Password reset successfully'
                });
            }
            catch (error) {
                console.error('Reset password error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                res.status(400).json({
                    status: 'error',
                    errors: { code: 'RESET_FAILED', message: errorMessage }
                });
            }
        });
    }
}
exports.AuthController = AuthController;
