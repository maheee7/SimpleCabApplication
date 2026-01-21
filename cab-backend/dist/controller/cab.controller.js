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
exports.completeRide = exports.bookRide = exports.checkEmployeeBooking = exports.getCabDetails = exports.updateDriverAvailability = exports.cancelRide = exports.assignDriver = exports.getAvailableDrivers = exports.getPendingRequests = void 0;
const cab_service_1 = require("../service/cab.service");
const cab_repository_1 = require("../repository/cab.repository");
const cabService = new cab_service_1.CabService(new cab_repository_1.CabRepository());
const getPendingRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield cabService.getPendingRequests();
        res.json({ success: true, data: requests });
    }
    catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.getPendingRequests = getPendingRequests;
const getAvailableDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const drivers = yield cabService.getAvailableDrivers();
        res.json({ success: true, data: drivers });
    }
    catch (error) {
        console.error("Error fetching available drivers:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});
exports.getAvailableDrivers = getAvailableDrivers;
const assignDriver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { requestIds, driverId, vehicleId } = req.body;
    try {
        const success = yield cabService.assignDriver(requestIds, driverId, vehicleId);
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
exports.assignDriver = assignDriver;
const cancelRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId, requestId } = req.body;
    try {
        const success = yield cabService.cancelRide(employeeId, requestId);
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
exports.cancelRide = cancelRide;
const updateDriverAvailability = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { driverId, available } = req.body;
    try {
        const success = yield cabService.updateDriverAvailability(driverId, available);
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
exports.updateDriverAvailability = updateDriverAvailability;
const getCabDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date, timeSlot } = req.query;
    try {
        if (!date || !timeSlot) {
            return res.status(400).json({ success: false, message: "Date and Time Slot are required" });
        }
        const cabData = yield cabService.getCabDetails(date, timeSlot);
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
exports.getCabDetails = getCabDetails;
const checkEmployeeBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.query;
        console.log(employeeId, "controller", Number(employeeId));
        const result = yield cabService.checkEmployeeBooking(Number(employeeId));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error checking booking status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.checkEmployeeBooking = checkEmployeeBooking;
const bookRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId, routeId, timeSlot, date } = req.body;
        const result = yield cabService.bookRide(Number(employeeId), routeId, timeSlot, date);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Error booking ride:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.bookRide = bookRide;
const completeRide = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { requestId } = req.params;
        const result = yield cabService.completeRide(Number(requestId));
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error updating ride status:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.completeRide = completeRide;
