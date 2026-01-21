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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'oJBpjyICNsMQPdw4H28Q69toyYUjjob1Z7VrxWR9525';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'mpnG03uGZBqUdck2ygkeHkw3xNDEdU8eWC3hYDaR0xD';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
class AuthService {
    constructor(repository) {
        this.repository = repository;
    }
    login(credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find user by email or username
                let user = null;
                if (credentials.email) {
                    user = yield this.repository.getUserByEmail(credentials.email);
                }
                else if (credentials.username) {
                    user = yield this.repository.getUserByUsername(credentials.username);
                }
                if (!user) {
                    throw new Error('Invalid credentials: User not found');
                }
                // Verify password
                const isPasswordValid = yield this.repository.verifyPassword(credentials.password, user.password_hash);
                if (!isPasswordValid) {
                    throw new Error('Invalid credentials: Incorrect password');
                }
                // Generate tokens
                const tokenPayload = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
                const accessToken = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, {
                    expiresIn: ACCESS_TOKEN_EXPIRY,
                });
                const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
                    expiresIn: REFRESH_TOKEN_EXPIRY,
                });
                return {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        name: user.name,
                        role: user.role,
                    },
                };
            }
            catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        });
    }
    verifyAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                return decoded;
            }
            catch (error) {
                console.error('Token verification error:', error);
                throw new Error('Invalid or expired token');
            }
        });
    }
    refreshAccessToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
                const user = yield this.repository.getUserById(decoded.id);
                if (!user) {
                    throw new Error('User not found');
                }
                const tokenPayload = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
                const accessToken = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, {
                    expiresIn: ACCESS_TOKEN_EXPIRY,
                });
                return { accessToken };
            }
            catch (error) {
                console.error('Refresh token error:', error);
                throw new Error('Invalid or expired refresh token');
            }
        });
    }
    signup(signupData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Validate input
                if (signupData.password !== signupData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (signupData.password.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                // Create user
                const user = yield this.repository.createUser(signupData.email, signupData.username, signupData.name, signupData.password, signupData.role);
                // Generate tokens
                const tokenPayload = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                };
                const accessToken = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, {
                    expiresIn: ACCESS_TOKEN_EXPIRY,
                });
                const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, REFRESH_TOKEN_SECRET, {
                    expiresIn: REFRESH_TOKEN_EXPIRY,
                });
                return {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        name: user.name,
                        role: user.role,
                    },
                };
            }
            catch (error) {
                console.error('Signup error:', error);
                throw error;
            }
        });
    }
    resetPassword(userId, newPassword, confirmPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (newPassword !== confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (newPassword.length < 6) {
                    throw new Error('Password must be at least 6 characters long');
                }
                yield this.repository.updatePassword(userId, newPassword);
                return { message: 'Password reset successfully' };
            }
            catch (error) {
                console.error('Password reset error:', error);
                throw error;
            }
        });
    }
}
exports.AuthService = AuthService;
