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
exports.EmployeeController = void 0;
class EmployeeController {
    constructor(employeeService) {
        this.employeeService = employeeService;
    }
    createEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.employeeService.createEmployee(req.body);
                res.status(201).json({
                    status: 'success',
                    message: 'Employee added successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    getEmployees(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const search = req.query.search;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const offset = (page - 1) * limit;
                const result = yield this.employeeService.getEmployees(search, limit, offset);
                res.json({
                    status: 'success',
                    data: result,
                    message: 'Employees retrieved successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    deleteEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.employeeService.deleteEmployee(Number(req.params.id));
                res.json({
                    status: 'success',
                    message: 'Employee deleted successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    updateEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.employeeService.updateEmployee(Number(req.params.id), req.body);
                res.json({
                    status: 'success',
                    message: 'Employee updated successfully'
                });
            }
            catch (error) {
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
