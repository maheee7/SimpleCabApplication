// src/route/employee.route.ts
import express from 'express';
import { EmployeeController } from '../controller/employee.controller';
import { EmployeeService } from '../service/employee.service';
import { EmployeeRepository } from '../repository/employee.repository';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Instantiate controller with dependencies
const employeeRepository = new EmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);
const employeeController = new EmployeeController(employeeService);

// Apply authMiddleware to all routes, adminMiddleware to sensitive ones
router.use(authMiddleware);

router.post('/', adminMiddleware, (req, res) => employeeController.createEmployee(req, res));
router.get('/', (req, res) => employeeController.getEmployees(req, res));
router.put('/:id', adminMiddleware, (req, res) => employeeController.updateEmployee(req, res));
router.delete('/:id', adminMiddleware, (req, res) => employeeController.deleteEmployee(req, res));

export default router;