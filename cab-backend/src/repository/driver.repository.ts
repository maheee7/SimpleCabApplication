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

  
  async availableDriver(driver: driverAvailable): Promise<{ success: boolean; message?: string }> {
    try {
      console.log(driver, "from the availableDriver repository");
      debugger
      // Check if driver availability record already exists
      console.log("About to query driver_availability table for driver:", driver.driverId);
      
      const [existing]: any = await this.pool.query(
        `SELECT driver_id FROM driver_availability WHERE driver_id = ?`,
        [driver.driverId]
      );
      
      console.log("Query result:", existing);
      console.log("existing array:", existing);
      console.log("Existing length:", existing.length, "Type:", typeof existing);
      
      if (existing && existing.length > 0) {
        // Driver record exists, so UPDATE it
        console.log("Driver record exists. Updating...");
        const updateQuery = `UPDATE driver_availability 
          SET available = ?, avai_date = ? 
          WHERE driver_id = ?`;
        console.log("Updating driver availability for driver:", driver.driverId);
        console.log("Update values:", driver.isAvailable, driver.date);
        
        const updateResult = await this.pool.query(updateQuery, [driver.isAvailable, driver.date, driver.driverId]);
        console.log("Update result:", updateResult);
        
        return { success: true, message: 'Driver availability updated successfully' };
      } else {
        // Driver record doesn't exist, so INSERT a new one
        console.log("Driver record does NOT exist. Inserting new record...");
        const insertQuery = `INSERT INTO driver_availability (driver_id, available, avai_date) VALUES (?, ?, ?)`;
        console.log("Inserting new driver availability for driver:", driver.driverId);
        console.log("Insert values:", driver.driverId, driver.isAvailable, driver.date);
        
        const insertResult = await this.pool.query(insertQuery, [driver.driverId, driver.isAvailable, driver.date]);
        console.log("Insert result:", insertResult);
        
        return { success: true, message: 'Driver availability created successfully' };
      }
    } catch (error) {
      console.error('CATCH BLOCK - Error updating/creating driver availability:', error);
      console.error('Error message:', (error as any).message);
      console.error('Error code:', (error as any).code);
      throw error;
    }
  }

    async getEmployeesForDriver(driverId: number): Promise<any> {
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
    console.log(rows,"rows from getEmployeesForDriver");
    if (rows.length === 0) {
     const query = `select driver_id as driverID, available as driverAvailable, avai_date as availabilityDate from driver_availability where driver_id = ?`;
    const [rows]: any = await this.pool.query(query, [driverId]);
    console.log(rows,"rows.length");
    
    return rows;

    }
    return rows;
  };
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

