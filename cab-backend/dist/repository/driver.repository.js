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
exports.DriverRepository = void 0;
const db_1 = require("../config/db");
class DriverRepository {
    constructor() {
        this.pool = db_1.databaseConfig;
    }
    createDriver(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if phone or license number already exists
                const [existing] = yield this.pool.execute(`SELECT id FROM drivers WHERE phone = ? OR licenseNumber = ?`, [driver.phone, driver.licenseNumber]);
                if (existing.length > 0) {
                    return { success: false, message: 'Phone number or License number already exists' };
                }
                // Insert driver
                const query = `INSERT INTO drivers (name, phone, licenseNumber, available) VALUES (?, ?, ?, ?)`;
                yield this.pool.execute(query, [driver.name, driver.phone, driver.licenseNumber, driver.available]);
                return { success: true };
            }
            catch (error) {
                console.error('Error creating driver:', error);
                throw error;
            }
        });
    }
    getDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
            const [rows] = yield this.pool.execute('SELECT * FROM drivers');
            return rows;
        });
    }
    updateDriver(id, driver) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            try {
                yield connection.beginTransaction();
                // Check if the driver exists
                const [existing] = yield connection.execute(`SELECT id FROM drivers WHERE id = ? FOR UPDATE`, [id]);
                if (existing.length === 0) {
                    yield connection.rollback();
                    return { success: false, message: 'Driver not found' };
                }
                // Ensure no duplicate phone or license number
                const [duplicateCheck] = yield connection.execute(`SELECT id FROM drivers WHERE (phone = ? OR licenseNumber = ?) AND id != ?`, [driver.phone, driver.licenseNumber, id]);
                if (duplicateCheck.length > 0) {
                    yield connection.rollback();
                    return { success: false, message: 'Phone number or License number already in use' };
                }
                // Update driver details
                const query = `UPDATE drivers SET name=?, phone=?, licenseNumber=?, available=? WHERE id=?`;
                yield connection.execute(query, [driver.name, driver.phone, driver.licenseNumber, driver.available, id]);
                yield connection.commit();
                return { success: true };
            }
            catch (error) {
                yield connection.rollback();
                console.error('Error updating driver:', error);
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    deleteDriver(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            try {
                yield connection.beginTransaction();
                // Check if the driver exists
                const [existing] = yield connection.execute(`SELECT id FROM drivers WHERE id = ? FOR UPDATE`, [id]);
                if (existing.length === 0) {
                    yield connection.rollback();
                    return { success: false, message: 'Driver not found' };
                }
                // Delete the driver
                yield connection.execute(`DELETE FROM drivers WHERE id = ?`, [id]);
                yield connection.commit();
                return { success: true };
            }
            catch (error) {
                yield connection.rollback();
                console.error('Error deleting driver:', error);
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
    getDriverAvailability(driverId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const numericDriverId = Number(driverId);
                console.log("Checking driver availability for driver:", numericDriverId);
                const [existing] = yield this.pool.query(`SELECT driver_id, available FROM driver_availability WHERE driver_id = ?`, [numericDriverId]);
                console.log("Availability check result:", existing);
                if (existing && Array.isArray(existing) && existing.length > 0) {
                    // Record exists, return availability status
                    const isAvailable = existing[0].available === 1 || existing[0].available === true;
                    console.log("Driver found. Available:", isAvailable);
                    return {
                        available: isAvailable,
                        driverId: numericDriverId
                    };
                }
                else {
                    // Record doesn't exist, create one with available = 0
                    console.log("Driver not found in availability table. Creating new record with available = 0");
                    const insertQuery = `INSERT INTO driver_availability (driver_id, available, avai_date) VALUES (?, ?, ?)`;
                    const today = new Date().toISOString().split("T")[0];
                    yield this.pool.query(insertQuery, [numericDriverId, 1, today]);
                    console.log("New availability record created for driver:", numericDriverId);
                    return {
                        available: true,
                        driverId: numericDriverId
                    };
                }
            }
            catch (error) {
                console.error("Error getting driver availability:", error);
                throw error;
            }
        });
    }
    availableDriver(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(driver, "from the availableDriver repository");
                // Ensure driverId is a number
                const driverId = Number(driver.driverId);
                const isAvailable = driver.isAvailable;
                console.log("Converted values - driverId:", driverId, "isAvailable:", isAvailable);
                // Check if driver availability record already exists
                const [existing] = yield this.pool.query(`SELECT driver_id FROM driver_availability WHERE driver_id = ?`, [driverId]);
                console.log("Existing length:", existing.length);
                if (existing && Array.isArray(existing) && existing.length > 0) {
                    // Driver record exists, so UPDATE it
                    console.log("✓ Driver record EXISTS. Updating...");
                    const updateQuery = `UPDATE driver_availability 
          SET available = ?, avai_date = ? 
          WHERE driver_id = ?`;
                    const [updateResult] = yield this.pool.query(updateQuery, [isAvailable ? 1 : 0, driver.date, driverId]);
                    console.log("Update successful. Affected rows:", updateResult.affectedRows);
                    return { success: true, message: 'Driver availability updated successfully' };
                }
                else {
                    // Driver record doesn't exist, so INSERT a new one
                    console.log("✗ Driver record does NOT exist. Creating new record...");
                    const insertQuery = `INSERT INTO driver_availability (driver_id, available, avai_date) VALUES (?, ?, ?)`;
                    const [insertResult] = yield this.pool.query(insertQuery, [driverId, isAvailable ? 1 : 0, driver.date]);
                    console.log("Insert successful. Inserted ID:", insertResult.insertId);
                    return { success: true, message: 'Driver availability created successfully' };
                }
            }
            catch (error) {
                console.error("Error updating/creating driver availability:", error);
                throw error;
            }
        });
    }
    getEmployeesForDriver(driverId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const [rows] = yield this.pool.query(query, [driverId]);
                console.log(rows, "rows from getEmployeesForDriver");
                if (rows.length === 0) {
                    // No allocated trips, check availability record
                    const availabilityQuery = `SELECT driver_id as driverId, available as driverAvailable, avai_date as availabilityDate FROM driver_availability WHERE driver_id = ?`;
                    const [availabilityRows] = yield this.pool.query(availabilityQuery, [driverId]);
                    console.log(availabilityRows, "availability rows");
                    return availabilityRows;
                }
                return rows;
            }
            catch (error) {
                console.error("Error in getEmployeesForDriver:", error);
                throw error;
            }
        });
    }
    completeTrip(driverId, tripId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      UPDATE cab_requests cr
      INNER JOIN trip_allocations ta ON ta.request_id = cr.id
      SET cr.status = 'Completed  ', ta.status = 'Completed'
      WHERE ta.driver_id = ? AND ta.id = ?;
    `;
            console.log(query);
            const [rows] = yield this.pool.query(query, [driverId, tripId]);
            console.log(rows);
        });
    }
    ;
}
exports.DriverRepository = DriverRepository;
// const updateDriverQuery = `UPDATE drivers SET available = true WHERE id = ?;`;
// const[rows1]=await this.pool.query(updateDriverQuery, [driverId]);
