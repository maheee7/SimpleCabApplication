import { databaseConfig } from '../config/db';
import { Driver, driverAvailable } from '../models/driverModel';
import { Pool } from "mysql2/promise";

export class DriverRepository {

  private pool: Pool;
  
  constructor() {
    this.pool = databaseConfig;
  }

  async createDriver(driver: Driver): Promise<{ success: boolean; message?: string }> {
    try {
      // Check if phone or license number already exists
      const [existing] = await this.pool.execute(
        `SELECT id FROM drivers WHERE phone = ? OR licenseNumber = ?`,
        [driver.phone, driver.licenseNumber]
      );

      if ((existing as any[]).length > 0) {
        return { success: false, message: 'Phone number or License number already exists' };
      }

      // Insert driver
      const query = `INSERT INTO drivers (name, phone, licenseNumber, available) VALUES (?, ?, ?, ?)`;
      await this.pool.execute(query, [driver.name, driver.phone, driver.licenseNumber, driver.available]);
      return { success: true };
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  async getDrivers(): Promise<Driver[]> {
    const [rows] = await this.pool.execute('SELECT * FROM drivers');
    return rows as Driver[];
  }


  async updateDriver(id: number, driver: Driver): Promise<{ success: boolean; message?: string }> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
  
      // Check if the driver exists
      const [existing] = await connection.execute(`SELECT id FROM drivers WHERE id = ? FOR UPDATE`, [id]);
      if ((existing as any[]).length === 0) {
        await connection.rollback();
        return { success: false, message: 'Driver not found' };
      }
  
      // Ensure no duplicate phone or license number
      const [duplicateCheck] = await connection.execute(
        `SELECT id FROM drivers WHERE (phone = ? OR licenseNumber = ?) AND id != ?`,
        [driver.phone, driver.licenseNumber, id]
      );
      if ((duplicateCheck as any[]).length > 0) {
        await connection.rollback();
        return { success: false, message: 'Phone number or License number already in use' };
      }
  
      // Update driver details
      const query = `UPDATE drivers SET name=?, phone=?, licenseNumber=?, available=? WHERE id=?`;
      await connection.execute(query, [driver.name, driver.phone, driver.licenseNumber, driver.available, id]);
  
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Error updating driver:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async deleteDriver(id: number): Promise<{ success: boolean; message?: string }> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
  
      // Check if the driver exists
      const [existing] = await connection.execute(`SELECT id FROM drivers WHERE id = ? FOR UPDATE`, [id]);
      if ((existing as any[]).length === 0) {
        await connection.rollback();
        return { success: false, message: 'Driver not found' };
      }
  
      // Delete the driver
      await connection.execute(`DELETE FROM drivers WHERE id = ?`, [id]);
  
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting driver:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  
  async getDriverAvailability(driverId: number): Promise<{ available: boolean; driverId: number }> {
    try {
      const numericDriverId = Number(driverId);
      console.log("Checking driver availability for driver:", numericDriverId);
      
      const [existing]: any = await this.pool.query(
        `SELECT driver_id, available FROM driver_availability WHERE driver_id = ?`,
        [numericDriverId]
      );
      
      console.log("Availability check result:", existing);
      
      if (existing && Array.isArray(existing) && existing.length > 0) {
        // Record exists, return availability status
        const isAvailable = existing[0].available === 1 || existing[0].available === true;
        console.log("Driver found. Available:", isAvailable);
        return { 
          available: isAvailable, 
          driverId: numericDriverId 
        };
      } else {
        // Record doesn't exist, create one with available = 0
        console.log("Driver not found in availability table. Creating new record with available = 0");
        const insertQuery = `INSERT INTO driver_availability (driver_id, available, avai_date) VALUES (?, ?, ?)`;
        const today = new Date().toISOString().split("T")[0];
        
        await this.pool.query(insertQuery, [numericDriverId, 1, today]);
        console.log("New availability record created for driver:", numericDriverId);
        
        return { 
          available: true, 
          driverId: numericDriverId 
        };
      }
    } catch (error) {
      console.error("Error getting driver availability:", error);
      throw error;
    }
  }

  async availableDriver(driver: driverAvailable): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(driver, "from the availableDriver repository");
      
      // Ensure driverId is a number
      const driverId = Number(driver.driverId);
      const isAvailable = driver.isAvailable 
      
      console.log("Converted values - driverId:", driverId, "isAvailable:", isAvailable);
      
      // Check if driver availability record already exists
      const [existing]: any = await this.pool.query(
        `SELECT driver_id FROM driver_availability WHERE driver_id = ?`,
        [driverId]
      );
      
      console.log("Existing length:", existing.length);
      
      if (existing && Array.isArray(existing) && existing.length > 0) {
        // Driver record exists, so UPDATE it
        console.log("✓ Driver record EXISTS. Updating...");
        const updateQuery = `UPDATE driver_availability 
          SET available = ?, avai_date = ? 
          WHERE driver_id = ?`;
        
        const [updateResult]: any = await this.pool.query(
          updateQuery, 
          [isAvailable ? 1 : 0, driver.date, driverId]
        );
        console.log("Update successful. Affected rows:", updateResult.affectedRows);
        
        return { success: true, message: 'Driver availability updated successfully' };
      } else {
        // Driver record doesn't exist, so INSERT a new one
        console.log("✗ Driver record does NOT exist. Creating new record...");
        const insertQuery = `INSERT INTO driver_availability (driver_id, available, avai_date) VALUES (?, ?, ?)`;
        
        const [insertResult]: any = await this.pool.query(
          insertQuery, 
          [driverId, isAvailable ? 1 : 0, driver.date]
        );
        console.log("Insert successful. Inserted ID:", insertResult.insertId);
        
        return { success: true, message: 'Driver availability created successfully' };
      }
    } catch (error) {
      console.error("Error updating/creating driver availability:", error);
      throw error;
    }
  }

  async getEmployeesForDriver(driverId: number): Promise<any> {
    try {
      const query = `
        SELECT 
          e.name AS employeeName, 
          e.id AS employeeId, 
          e.phone AS employeeNumber, 
          d.id AS driverId, 
          d.name AS driverName, 
          d.phone AS driverNumber, 
          v.vehicle_number AS cabNumber, 
          v.type AS vehicleType, 
          cr.time_slot, 
          cr.date, 
          cr.status, 
          cr.route_id,
          ta.id as trip_id,
          da.available AS driverAvailable, da.avai_date AS availabilityDate
        FROM cab_requests AS cr
        INNER JOIN trip_allocations AS ta ON ta.request_id = cr.id
        INNER JOIN employees e ON e.id = cr.employee_id
        INNER JOIN drivers d ON ta.driver_id = d.id
        INNER JOIN vehicles v ON v.id = ta.vehicle_id
        INNER JOIN driver_availability da ON da.driver_id = d.id
        WHERE d.id = ? and ta.status = 'Allocated';
      `;
    
      const [rows]: any = await this.pool.query(query, [driverId]);
      console.log(rows, "rows from getEmployeesForDriver");
      
      if (rows.length === 0) {
        // No allocated trips, check availability record
        const availabilityQuery = `SELECT driver_id as driverId, available as driverAvailable, avai_date as availabilityDate FROM driver_availability WHERE driver_id = ?`;
        const [availabilityRows]: any = await this.pool.query(availabilityQuery, [driverId]);
        console.log(availabilityRows, "availability rows");
        
        return availabilityRows;
      }
      return rows;
    } catch (error) {
      console.error("Error in getEmployeesForDriver:", error);
      throw error;
    }
  }
  async completeTrip (driverId: number, tripId: number): Promise<void> {
    const query = `
      UPDATE cab_requests cr
      INNER JOIN trip_allocations ta ON ta.request_id = cr.id
      SET cr.status = 'Completed  ', ta.status = 'Completed'
      WHERE ta.driver_id = ? AND ta.id = ?;
    `;
    console.log(query); 

   const [rows]= await this.pool.query(query, [driverId, tripId]);

  console.log(rows);
  
  };
  
}

// const updateDriverQuery = `UPDATE drivers SET available = true WHERE id = ?;`;
// const[rows1]=await this.pool.query(updateDriverQuery, [driverId]);

