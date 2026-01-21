// src/route/employee.route.ts
import express from 'express';
import { createEmployee, getEmployees, updateEmployee } from '../controller/employee.controller';

const router = express.Router();
router.post('/', createEmployee);
router.get('/', getEmployees);
router.put('/:id', updateEmployee);
export default router;