import { EmployeeRepository } from '../repository/employee.repository';
import { Employee } from '../models/employeeModel';

export class EmployeeService {
  private employeeRepository: EmployeeRepository;

  constructor(employeeRepository: EmployeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async createEmployee(employee: Employee): Promise<void> {
    await this.employeeRepository.createEmployee(employee);
  }

  async getEmployees(search?: string, limit?: number, offset?: number): Promise<{ employee: Employee[]; totalcount: number }> {
    return await this.employeeRepository.getEmployees(search, limit, offset);
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.employeeRepository.deleteEmployee(id);
  }

  async updateEmployee(id: number, employee: Employee): Promise<void> {
    await this.employeeRepository.updateEmployee(id, employee);
  }
}
