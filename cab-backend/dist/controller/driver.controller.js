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
exports.DriverController = void 0;
class DriverController {
    constructor(driverService) {
        this.driverService = driverService;
    }
    createDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.driverService.createDriver(req.body);
                res.status(201).json({ message: 'Driver added successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
    getDrivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const drivers = yield this.driverService.getDrivers();
                res.status(200).json(drivers);
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
    updateDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.driverService.updateDriver(Number(req.params.id), req.body);
                res.json({ message: 'Driver updated successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
    availableDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("=== availableDriver controller called ===");
                console.log("Request body:", req.body);
                const result = yield this.driverService.availableDriver(req.body);
                console.log("Service returned:", result);
                res.json({ message: 'Driver currently available', result });
            }
            catch (error) {
                console.error("=== availableDriver controller ERROR ===");
                console.error("Error:", error);
                res.status(500).json({ message: 'Internal Server Error', error });
            }
        });
    }
    checkDriverAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const driverId = Number(req.params.driverId);
                if (isNaN(driverId)) {
                    res.status(400).json({ message: "Invalid driver ID" });
                    return;
                }
                console.log("Checking availability for driver:", driverId);
                const availability = yield this.driverService.getDriverAvailability(driverId);
                res.status(200).json(availability);
            }
            catch (error) {
                console.error("Error checking driver availability:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    getAssignedEmployees(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const driverId = parseInt(req.params.driverId, 10);
                if (isNaN(driverId)) {
                    res.status(400).json({ message: "Invalid driver ID" });
                    return;
                }
                const assignedEmployees = yield this.driverService.getEmployeesByDriverId(driverId);
                res.status(200).json(assignedEmployees);
            }
            catch (error) {
                console.error("Error fetching assigned employees:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    completeTrip(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { driverId, trip_id } = req.body;
                console.log(driverId, trip_id, req.body);
                if (!driverId || !trip_id) {
                    res.status(400).json({ message: "Driver ID and Trip ID are required." });
                    return;
                }
                console.log(driverId, trip_id);
                yield this.driverService.completeTrip(driverId, trip_id);
                res.status(200).json({ message: "Trip marked as completed. Driver is now available." });
            }
            catch (error) {
                console.error("Error marking trip as completed:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
exports.DriverController = DriverController;
