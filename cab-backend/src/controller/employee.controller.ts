// src/controller/employee.controller.ts
import { Request, Response } from 'express';
import { EmployeeService } from '../service/employee.service';
import { EmployeeRepository } from '../repository/employee.repository';

const employeeService = new EmployeeService(new EmployeeRepository());

export const createEmployee = async (req: Request, res: Response) => {
  try {
    await employeeService.createEmployee(req.body);
    res.status(201).json({ message: 'Employee added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getEmployees();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    await employeeService.updateEmployee(Number(req.params.id), req.body);
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};
