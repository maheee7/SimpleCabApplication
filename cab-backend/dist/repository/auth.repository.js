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
exports.AuthRepository = void 0;
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthRepository {
    constructor() {
        this.pool = db_1.databaseConfig;
    }
    getUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield this.pool.query(`SELECT * FROM users WHERE email = ? AND is_active = TRUE`, [email]);
                if (rows && rows.length > 0) {
                    return rows[0];
                }
                return null;
            }
            catch (error) {
                console.error('Error fetching user by email:', error);
                throw error;
            }
        });
    }
    getUserByUsername(username) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield this.pool.query(`SELECT * FROM users WHERE username = ? AND is_active = TRUE`, [username]);
                if (rows && rows.length > 0) {
                    return rows[0];
                }
                return null;
            }
            catch (error) {
                console.error('Error fetching user by username:', error);
                throw error;
            }
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield this.pool.query(`SELECT * FROM users WHERE id = ? AND is_active = TRUE`, [id]);
                if (rows && rows.length > 0) {
                    return rows[0];
                }
                return null;
            }
            catch (error) {
                console.error('Error fetching user by ID:', error);
                throw error;
            }
        });
    }
    verifyPassword(plainPassword, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield bcrypt_1.default.compare(plainPassword, hashedPassword);
            }
            catch (error) {
                console.error('Error verifying password:', error);
                throw error;
            }
        });
    }
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const saltRounds = 10;
                return yield bcrypt_1.default.hash(password, saltRounds);
            }
            catch (error) {
                console.error('Error hashing password:', error);
                throw error;
            }
        });
    }
    createUser(email, username, name, password, role) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if email already exists
                const existingEmail = yield this.getUserByEmail(email);
                if (existingEmail) {
                    throw new Error('Email already exists');
                }
                // Check if username already exists
                const existingUsername = yield this.getUserByUsername(username);
                if (existingUsername) {
                    throw new Error('Username already exists');
                }
                // Hash password
                const passwordHash = yield this.hashPassword(password);
                // Insert user
                const [result] = yield this.pool.query(`INSERT INTO users (email, username, name, password_hash, role, must_reset_password, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [email, username, name, passwordHash, role, false, true]);
                // Fetch and return created user
                const user = yield this.getUserByEmail(email);
                if (!user) {
                    throw new Error('Failed to create user');
                }
                return user;
            }
            catch (error) {
                console.error('Error creating user:', error);
                throw error;
            }
        });
    }
    updatePassword(userId, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hashedPassword = yield this.hashPassword(newPassword);
                yield this.pool.query(`UPDATE users SET password_hash = ?, must_reset_password = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [hashedPassword, userId]);
            }
            catch (error) {
                console.error('Error updating password:', error);
                throw error;
            }
        });
    }
}
exports.AuthRepository = AuthRepository;
