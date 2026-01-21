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
exports.EmployeeRepository = void 0;
const db_1 = require("../config/db");
class EmployeeRepository {
    constructor() {
        this.pool = db_1.databaseConfig;
    }
    createEmployee(employee) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if phone or email already exists
                const [existing] = yield this.pool.execute(`SELECT id FROM employees WHERE phone = ? OR email = ?`, [employee.phone, employee.email]);
                if (existing.length > 0) {
                    return { success: false, message: 'Phone number or Email already exists' };
                }
                // Insert employee
                const query = `INSERT INTO employees (name, phone, email, address) VALUES (?, ?, ?, ?)`;
                yield this.pool.execute(query, [employee.name, employee.phone, employee.email, employee.address]);
                return { success: true };
            }
            catch (error) {
                console.error('Error creating employee:', error);
                throw error; // Pass to the controller
            }
        });
    }
    getEmployees() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield this.pool.execute('SELECT * FROM employees');
            return rows;
        });
    }
    updateEmployee(id, employee) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            try {
                yield connection.beginTransaction();
                // Check if the employee exists
                const [existing] = yield connection.execute(`SELECT id FROM employees WHERE id = ? FOR UPDATE`, [id]);
                if (existing.length === 0) {
                    yield connection.rollback();
                    return { success: false, message: 'Employee not found' };
                }
                // Ensure no duplicate phone or email
                const [duplicateCheck] = yield connection.execute(`SELECT id FROM employees WHERE (phone = ? OR email = ?) AND id != ?`, [employee.phone, employee.email, id]);
                if (duplicateCheck.length > 0) {
                    yield connection.rollback();
                    return { success: false, message: 'Phone number or Email already in use' };
                }
                // Update employee
                const query = `UPDATE employees SET name=?, phone=?, email=?, address=? WHERE id=?`;
                yield connection.execute(query, [employee.name, employee.phone, employee.email, employee.address, id]);
                yield connection.commit();
                return { success: true };
            }
            catch (error) {
                yield connection.rollback();
                console.error('Error updating employee:', error);
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    deleteEmployee(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            try {
                yield connection.beginTransaction();
                // Check if the employee exists
                const [existing] = yield connection.execute(`SELECT id FROM employees WHERE id = ? FOR UPDATE`, [id]);
                if (existing.length === 0) {
                    yield connection.rollback();
                    return { success: false, message: 'Employee not found' };
                }
                // Delete the employee
                yield connection.execute(`DELETE FROM employees WHERE id = ?`, [id]);
                yield connection.commit();
                return { success: true };
            }
            catch (error) {
                yield connection.rollback();
                console.error('Error deleting employee:', error);
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
}
exports.EmployeeRepository = EmployeeRepository;
