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

  async getEmployees(): Promise<Employee[]> {
    return await this.employeeRepository.getEmployees();
  }

  async updateEmployee(id: number, employee: Employee): Promise<void> {
    await this.employeeRepository.updateEmployee(id, employee);
  }
}
