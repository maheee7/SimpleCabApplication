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
exports.cabController = exports.CabController = void 0;
const cab_service_1 = require("../service/cab.service");
const cab_repository_1 = require("../repository/cab.repository");
class CabController {
    constructor(cabService) {
        this.getPendingRequests = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const requests = yield this.cabService.getPendingRequests();
                res.json({ success: true, data: requests });
            }
            catch (error) {
                console.error("Error fetching requests:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
        this.getAvailableDrivers = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const drivers = yield this.cabService.getAvailableDrivers();
                res.json({ success: true, data: drivers });
            }
            catch (error) {
                console.error("Error fetching available drivers:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
        this.assignDriver = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { requestIds, driverId, vehicleId } = req.body;
            try {
                const success = yield this.cabService.assignDriver(requestIds, driverId, vehicleId);
                if (!success) {
                    return res.status(400).json({ success: false, message: "Driver not available or not found" });
                }
                res.json({ success: true, message: "Driver assigned successfully" });
            }
            catch (error) {
                console.error("Error assigning driver:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
        this.cancelRide = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { employeeId, requestId } = req.body;
            try {
                const success = yield this.cabService.cancelRide(employeeId, requestId);
                if (!success) {
                    return res.status(400).json({ success: false, message: "Failed to cancel ride" });
                }
                res.json({ success: true, message: "Ride cancelled successfully" });
            }
            catch (error) {
                console.error("Error canceling ride:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
        this.updateDriverAvailability = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { driverId, available } = req.body;
            try {
                const success = yield this.cabService.updateDriverAvailability(driverId, available);
                if (!success) {
                    return res.status(400).json({ success: false, message: "Failed to update availability" });
                }
                res.json({ success: true, message: "Driver availability updated" });
            }
            catch (error) {
                console.error("Error updating driver availability:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
        if (!cabService) {
            throw new Error("CabService is undefined! Check if it's being correctly initialized.");
        }
        this.cabService = cabService;
        this.getPendingRequests = this.getPendingRequests.bind(this);
        this.getAvailableDrivers = this.getAvailableDrivers.bind(this);
        this.assignDriver = this.assignDriver.bind(this);
        this.cancelRide = this.cancelRide.bind(this);
        this.updateDriverAvailability = this.updateDriverAvailability.bind(this);
        this.getCabDetails = this.getCabDetails.bind(this);
        this.checkEmployeeBooking = this.checkEmployeeBooking.bind(this);
        this.bookRide = this.bookRide.bind(this);
        this.completeRide = this.completeRide.bind(this);
    }
    getCabDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { date, timeSlot } = req.query;
            try {
                // Validate request parameters
                if (!date || !timeSlot) {
                    return res.status(400).json({ success: false, message: "Date and Time Slot are required" });
                }
                const cabData = yield this.cabService.getCabDetails(date, timeSlot);
                if (!cabData) {
                    return res.status(404).json({ success: false, message: "No assigned cab details found" });
                }
                res.json({ success: true, assigned: true, data: cabData });
            }
            catch (error) {
                console.error("Error fetching cab details:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
    }
    checkEmployeeBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeId } = req.query;
                console.log(employeeId, "controller", Number(employeeId));
                const result = yield this.cabService.checkEmployeeBooking(Number(employeeId));
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error checking booking status:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    // Book a ride for an employee
    bookRide(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeId, routeId, timeSlot, date } = req.body;
                const result = yield this.cabService.bookRide(Number(employeeId), routeId, timeSlot, date);
                res.status(201).json(result);
            }
            catch (error) {
                console.error("Error booking ride:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
    // Mark a ride as completed
    completeRide(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = req.params;
                const result = yield this.cabService.completeRide(Number(requestId));
                res.status(200).json(result);
            }
            catch (error) {
                console.error("Error updating ride status:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });
    }
}
exports.CabController = CabController;
// ✅ Proper Dependency Injection
const cabRepository = new cab_repository_1.CabRepository();
const cabService = new cab_service_1.CabService(cabRepository);
exports.cabController = new CabController(cabService);
