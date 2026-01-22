// src/controller/employee.controller.ts
import { Request, Response } from 'express';
import { EmployeeService } from '../service/employee.service';

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor(employeeService: EmployeeService) {
    this.employeeService = employeeService;
  }

  async createEmployee(req: Request, res: Response) {
    try {
      await this.employeeService.createEmployee(req.body);
      res.status(201).json({ message: 'Employee added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }

  async getEmployees(req: Request, res: Response) {
    try {
      const employees = await this.employeeService.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      await this.employeeService.updateEmployee(Number(req.params.id), req.body);
      res.json({ message: 'Employee updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }
}
