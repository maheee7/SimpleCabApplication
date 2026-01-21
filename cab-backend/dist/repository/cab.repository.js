"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CabRepository = void 0;
const db_1 = require("../config/db");
class CabRepository {
    constructor() {
        this.pool = db_1.databaseConfig;
    }
    // Get pending requests for admin to allocate
    getPendingRequests() {
        return __awaiter(this, void 0, void 0, function* () {
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
            const [rows] = yield this.pool.query(query);
            console.log(rows);
            return rows;
        });
    }
    // Get available drivers for allocation
    getAvailableDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT d.id AS driver_id, d.name AS driver_name,da.updated_at as available_date, v.vehicle_number, da.available,v.type,v.id
      FROM drivers d
      JOIN driver_availability da ON d.id = da.driver_id
      JOIN vehicles as v ON v.id = d.vehicle_id
      WHERE da.available = TRUE;
    `;
            const [rows] = yield this.pool.query(query);
            return rows;
        });
    }
    // Assign a driver to employee requests
    assignDriver(requestIds, driverId, vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            try {
                yield connection.beginTransaction();
                // Update cab_requests status
                const updateRequestQuery = `
        UPDATE cab_requests 
        SET status = 'Allocated' 
        WHERE id IN (?) AND status = 'Pending';
      `;
                yield connection.query(updateRequestQuery, [requestIds]);
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
                yield connection.query(insertAllocationQuery, [values]);
                // Mark driver as unavailable
                const updateDriverQuery = `
        UPDATE driver_availability 
        SET available = FALSE 
        WHERE driver_id = ?;
      `;
                yield connection.query(updateDriverQuery, [driverId]);
                yield connection.commit();
                return true;
            }
            catch (error) {
                yield connection.rollback();
                console.error("Error assigning driver:", error);
                return false;
            }
            finally {
                connection.release();
            }
        });
    }
    // Employee cancels a ride
    cancelRide(employeeId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE cab_requests 
      SET status = 'Cancelled' 
      WHERE id = ? AND employee_id = ? AND status = 'Pending';
    `;
            const [result] = yield this.pool.query(query, [requestId, employeeId]);
            return result;
        });
    }
    updateDriverAvailability(driverId, available) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `UPDATE driver_availability 
      SET available = ? 
      WHERE driver_id = ?`;
            const [result] = yield this.pool.query(query, [available, driverId]);
            return result;
        });
    }
    getCabDetails(date, timeSlot) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const [rows] = yield this.pool.query(query, [date, timeSlot]);
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
                employees: rows.map((row) => ({
                    id: row.employeeId,
                    name: row.employeeName,
                    phone: row.employeeNumber,
                })),
            };
        });
    }
    // Driver updates availability
    checkEmployeeBooking(employeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT * FROM cab_requests 
      WHERE employee_id = ? 
      AND status IN ('Pending', 'Allocated') 
      AND date = CURDATE();
    `;
            const [rows] = yield this.pool.query(query, [employeeId]);
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
            const [rows1] = yield this.pool.query(queries, [employeeId]);
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
        });
    }
    // Book a ride for an employee
    bookRide(employeeId, routeId, timeSlot, date) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check for an existing booking before inserting
            const checkQuery = `
      SELECT * FROM cab_requests 
      WHERE employee_id = ? 
      AND status IN ('Pending', 'Allocated') 
      AND date = ?;
    `;
            const [existingBooking] = yield this.pool.query(checkQuery, [
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
            yield this.pool.query(insertQuery, [employeeId, routeId, timeSlot, date]);
            return { success: true, message: "Ride booked successfully!" };
        });
    }
    // Mark a ride as completed
    completeRide(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateQuery = `
      UPDATE cab_requests 
      SET status = 'Success' 
      WHERE id = ?;
    `;
            const [result] = yield this.pool.query(updateQuery, [requestId]);
            if (result.affectedRows === 0) {
                return { success: false, message: "Cab request not found" };
            }
            return { success: true, message: "Ride marked as successful!" };
        });
    }
}
exports.CabRepository = CabRepository;
