import { Pool } from "mysql2/promise";
import { databaseConfig } from "../config/db";

export class CabRepository {
  private pool: Pool;

  constructor() {
    this.pool = databaseConfig;
  }

  // Get pending requests for admin to allocate
  public async getPendingRequests() {
    const query = `
SELECT 
    cr.id, 
    cr.employee_id, 
    e.name AS employee_name, 
    cr.route_id, 
    r.route_name, 
    cr.time_slot, 
    cr.date
FROM cab_requests cr
JOIN employees e ON cr.employee_id = e.id
JOIN routes r ON cr.route_id = r.id
WHERE cr.status = 'Pending'
ORDER BY cr.date ASC, cr.time_slot ASC;
    `;
    const [rows] = await this.pool.query(query);
    console.log(rows);

    return rows;
  }

  // Get available drivers for allocation
  public async getAvailableDrivers() {
    const query = `
      SELECT d.id AS driver_id, d.name AS driver_name,da.updated_at as available_date, v.vehicle_number, da.available,v.type,v.id
      FROM drivers d
      JOIN driver_availability da ON d.id = da.driver_id
      JOIN vehicles as v ON v.id = d.vehicle_id
      WHERE da.available = TRUE;
    `;
    const [rows] = await this.pool.query(query);
    return rows;
  }

  // Assign a driver to employee requests
  public async assignDriver(
    requestIds: number[],
    driverId: number,
    vehicleId: number
  ) {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update cab_requests status
      const updateRequestQuery = `
        UPDATE cab_requests 
        SET status = 'Allocated' 
        WHERE id IN (?) AND status = 'Pending';
      `;
      await connection.query(updateRequestQuery, [requestIds]);

      // Insert into trip_allocations
      const insertAllocationQuery = `
        INSERT INTO trip_allocations (request_id, driver_id, vehicle_id) 
        VALUES ?;
      `;
      const values = requestIds.map((requestId) => [
        requestId,
        driverId,
        vehicleId,
      ]);
      await connection.query(insertAllocationQuery, [values]);

      // Mark driver as unavailable
      const updateDriverQuery = `
        UPDATE driver_availability 
        SET available = FALSE 
        WHERE driver_id = ?;
      `;
      await connection.query(updateDriverQuery, [driverId]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Error assigning driver:", error);
      return false;
    } finally {
      connection.release();
    }
  }

  // Employee cancels a ride
  public async cancelRide(employeeId: number, requestId: number) {
    const query = `
      UPDATE cab_requests 
      SET status = 'Cancelled' 
      WHERE id = ? AND employee_id = ? AND status = 'Pending';
    `;
    const [result] = await this.pool.query(query, [requestId, employeeId]);
    return result;
  }
  public async updateDriverAvailability(driverId: number, available: boolean) {
    const query = `UPDATE driver_availability 
      SET available = ? 
      WHERE driver_id = ?`;
    const [result] = await this.pool.query(query, [available, driverId]);
    return result;
  }
  public async getCabDetails(date: string, timeSlot: string) {
    const query = `SELECT 
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
        cr.route_id 
      FROM cab_requests AS cr 
      INNER JOIN trip_allocations AS ta ON ta.request_id = cr.id 
      INNER JOIN employees e ON e.id = cr.employee_id 
      INNER JOIN drivers d ON ta.driver_id = d.id 
      INNER JOIN vehicles v ON v.id = ta.vehicle_id 
      WHERE cr.date = ? AND cr.time_slot = ?`;
    const [rows]: any = await this.pool.query(query, [date, timeSlot]);

    if (!rows.length) {
      return null;
    }

    return {
      cabDetails: {
        cabNumber: rows[0].cabNumber,
        vehicleType: rows[0].vehicleType,
        driverName: rows[0].driverName,
        driverContact: rows[0].driverNumber,
      },
      employees: rows.map((row: any) => ({
        id: row.employeeId,
        name: row.employeeName,
        phone: row.employeeNumber,
      })),
    };
  }

  // Driver updates availability
  public async checkEmployeeBooking(employeeId: number) {
    const query = `
      SELECT * FROM cab_requests 
      WHERE employee_id = ? 
      AND status IN ('Pending', 'Allocated') 
      AND date IN (CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY));
    `;

    const [rows]: any = await this.pool.query(query, [employeeId]);
    console.log(rows, "from repository"); // Should print an array of results

    const queries = `
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
        cr.route_id 
      FROM cab_requests AS cr 
      INNER JOIN trip_allocations AS ta ON ta.request_id = cr.id 
      INNER JOIN employees e ON e.id = cr.employee_id 
      INNER JOIN drivers d ON ta.driver_id = d.id 
      INNER JOIN vehicles v ON v.id = ta.vehicle_id 
      WHERE e.id = ? and ta.status = 'Allocated'
    `;

    const [rows1]: any = await this.pool.query(queries, [employeeId]);
    console.log(rows1, "from repository join query");

    let status = rows.length > 0 ? rows[0].status : null;

    // Safely accessing cab details
    const cabData = rows1.length > 0 ? rows1[0] : {}; // Safe access

    let cabdetails = {
      driverId: cabData.driverId || "",
      driverName: cabData.driverName || "",
      driverNumber: cabData.driverNumber || "",
      cabNumber: cabData.cabNumber || "",
      vehicleType: cabData.vehicleType || "",
      time: cabData.time_slot || "",
      date: cabData.date ? cabData.date.toISOString().slice(0, 10) : "", // Ensure safe slicing
    };

    if (rows1.length > 0 && status === "Allocated") {
      return { empStatus: status, cab: cabdetails };
    }
    if (rows.length > 0 && status === "Pending") {
      return { empStatus: status, cab: {} };
    }

    return { empStatus: status, cab: {} };
  }

  // Book a ride for an employee
  public async bookRide(
    employeeId: number,
    routeId: number,
    timeSlot: string,
    date: string
  ) {
    // Check for an existing booking before inserting
    const checkQuery = `
      SELECT * FROM cab_requests 
      WHERE employee_id = ? 
      AND status IN ('Pending', 'Allocated') 
      AND date = ?;
    `;

    const [existingBooking]: any = await this.pool.query(checkQuery, [
      employeeId,
      date,
    ]);

    if (existingBooking.length > 0) {
      return {
        success: false,
        message: "You have an active ride. Complete it before booking again.",
      };
    }

    // Insert new ride request
    const insertQuery = `
      INSERT INTO cab_requests (employee_id, route_id, time_slot, date, status) 
      VALUES (?, ?, ?, ?, 'Pending');
    `;

    await this.pool.query(insertQuery, [employeeId, routeId, timeSlot, date]);

    return { success: true, message: "Ride booked successfully!" };
  }

  // Mark a ride as completed
  public async completeRide(requestId: number) {
    const updateQuery = `
      UPDATE cab_requests 
      SET status = 'Success' 
      WHERE id = ?;
    `;

    const [result]: any = await this.pool.query(updateQuery, [requestId]);

    if (result.affectedRows === 0) {
      return { success: false, message: "Cab request not found" };
    }
    return { success: true, message: "Ride marked as successful!" };
  }
}
