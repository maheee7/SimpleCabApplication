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
      res.status(201).json({
        status: 'success',
        message: 'Employee added successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async getEmployees(req: Request, res: Response) {
    try {
      const search = req.query.search as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const result = await this.employeeService.getEmployees(search, limit, offset);
      res.json({
        status: 'success',
        data: result,
        message: 'Employees retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async deleteEmployee(req: Request, res: Response) {
    try {
      await this.employeeService.deleteEmployee(Number(req.params.id));
      res.json({
        status: 'success',
        message: 'Employee deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async updateEmployee(req: Request, res: Response) {
    try {
      await this.employeeService.updateEmployee(Number(req.params.id), req.body);
      res.json({
        status: 'success',
        message: 'Employee updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }
}
