"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.databaseConfig = promise_1.default.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Mahe@123',
    database: 'cab',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
