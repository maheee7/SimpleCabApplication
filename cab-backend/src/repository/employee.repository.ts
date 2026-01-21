import { databaseConfig } from '../config/db';
import { Employee } from '../models/employeeModel';
import { Pool } from "mysql2/promise";

export class EmployeeRepository {

   private pool: Pool;
  
    constructor() {
      this.pool = databaseConfig;
    }

  async createEmployee(employee: Employee): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if phone or email already exists
      const [existing] = await this.pool.execute(
        `SELECT id FROM employees WHERE phone = ? OR email = ?`,
        [employee.phone, employee.email]
      );

      if ((existing as any[]).length > 0) {
        return { success: false, message: 'Phone number or Email already exists' };
      }

      // Insert employee
      const query = `INSERT INTO employees (name, phone, email, address) VALUES (?, ?, ?, ?)`;
      await this.pool.execute(query, [employee.name, employee.phone, employee.email, employee.address]);
      return { success: true };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error; // Pass to the controller
    }
  }

  async getEmployees(): Promise<Employee[]> {
    const [rows] = await this.pool.execute('SELECT * FROM employees');
    return rows as Employee[];
  }

  async updateEmployee(id: number, employee: Employee): Promise<{ success: boolean; message?: string }> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
  
      // Check if the employee exists
      const [existing] = await connection.execute(`SELECT id FROM employees WHERE id = ? FOR UPDATE`, [id]);
      if ((existing as any[]).length === 0) {
        await connection.rollback();
        return { success: false, message: 'Employee not found' };
      }
  
      // Ensure no duplicate phone or email
      const [duplicateCheck] = await connection.execute(
        `SELECT id FROM employees WHERE (phone = ? OR email = ?) AND id != ?`,
        [employee.phone, employee.email, id]
      );
      if ((duplicateCheck as any[]).length > 0) {
        await connection.rollback();
        return { success: false, message: 'Phone number or Email already in use' };
      }
  
      // Update employee
      const query = `UPDATE employees SET name=?, phone=?, email=?, address=? WHERE id=?`;
      await connection.execute(query, [employee.name, employee.phone, employee.email, employee.address, id]);
  
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Error updating employee:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteEmployee(id: number): Promise<{ success: boolean; message?: string }> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
  
      // Check if the employee exists
      const [existing] = await connection.execute(`SELECT id FROM employees WHERE id = ? FOR UPDATE`, [id]);
      if ((existing as any[]).length === 0) {
        await connection.rollback();
        return { success: false, message: 'Employee not found' };
      }
  
      // Delete the employee
      await connection.execute(`DELETE FROM employees WHERE id = ?`, [id]);
  
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting employee:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
 
  
}
