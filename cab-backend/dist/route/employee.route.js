"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/route/employee.route.ts
const express_1 = __importDefault(require("express"));
const employee_controller_1 = require("../controller/employee.controller");
const employee_service_1 = require("../service/employee.service");
const employee_repository_1 = require("../repository/employee.repository");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Instantiate controller with dependencies
const employeeRepository = new employee_repository_1.EmployeeRepository();
const employeeService = new employee_service_1.EmployeeService(employeeRepository);
const employeeController = new employee_controller_1.EmployeeController(employeeService);
// Apply authMiddleware to all routes, adminMiddleware to sensitive ones
router.use(auth_middleware_1.authMiddleware);
router.post('/', auth_middleware_1.adminMiddleware, (req, res) => employeeController.createEmployee(req, res));
router.get('/', (req, res) => employeeController.getEmployees(req, res));
router.put('/:id', auth_middleware_1.adminMiddleware, (req, res) => employeeController.updateEmployee(req, res));
router.delete('/:id', auth_middleware_1.adminMiddleware, (req, res) => employeeController.deleteEmployee(req, res));
exports.default = router;
