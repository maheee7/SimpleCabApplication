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
    availableDriver(driver) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(driver, "from the availableDriver repository");
                debugger;
                // Check if driver availability record already exists
                console.log("About to query driver_availability table for driver:", driver.driverId);
                const [existing] = yield this.pool.query(`SELECT driver_id FROM driver_availability WHERE driver_id = ?`, [driver.driverId]);
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
                    const updateResult = yield this.pool.query(updateQuery, [driver.isAvailable, driver.date, driver.driverId]);
                    console.log("Update result:", updateResult);
                    return { success: true, message: 'Driver availability updated successfully' };
                }
                else {
                    // Driver record doesn't exist, so INSERT a new one
                    console.log("Driver record does NOT exist. Inserting new record...");
                    const insertQuery = `INSERT INTO driver_availability (driver_id, available, avai_date) VALUES (?, ?, ?)`;
                    console.log("Inserting new driver availability for driver:", driver.driverId);
                    console.log("Insert values:", driver.driverId, driver.isAvailable, driver.date);
                    const insertResult = yield this.pool.query(insertQuery, [driver.driverId, driver.isAvailable, driver.date]);
                    console.log("Insert result:", insertResult);
                    return { success: true, message: 'Driver availability created successfully' };
                }
            }
            catch (error) {
                console.error('CATCH BLOCK - Error updating/creating driver availability:', error);
                console.error('Error message:', error.message);
                console.error('Error code:', error.code);
                throw error;
            }
        });
    }
    getEmployeesForDriver(driverId) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const query = `select * from driver_availability where driver_id = ?`;
                const [rows] = yield this.pool.query(query, [driverId]);
                console.log(rows, "rows.length");
                return rows;
            }
            return rows;
        });
    }
    ;
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
