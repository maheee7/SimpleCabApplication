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
                res.status(201).json({ message: 'Employee added successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
    getEmployees(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const employees = yield this.employeeService.getEmployees();
                res.json(employees);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
    updateEmployee(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.employeeService.updateEmployee(Number(req.params.id), req.body);
                res.json({ message: 'Employee updated successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
}
exports.EmployeeController = EmployeeController;
