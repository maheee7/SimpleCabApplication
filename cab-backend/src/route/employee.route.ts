// src/route/employee.route.ts
import express from 'express';
import { EmployeeController } from '../controller/employee.controller';
import { EmployeeService } from '../service/employee.service';
import { EmployeeRepository } from '../repository/employee.repository';

const router = express.Router();

// Instantiate controller with dependencies
const employeeRepository = new EmployeeRepository();
const employeeService = new EmployeeService(employeeRepository);
const employeeController = new EmployeeController(employeeService);

router.post('/', (req, res) => employeeController.createEmployee(req, res));
router.get('/', (req, res) => employeeController.getEmployees(req, res));
router.put('/:id', (req, res) => employeeController.updateEmployee(req, res));

export default router;