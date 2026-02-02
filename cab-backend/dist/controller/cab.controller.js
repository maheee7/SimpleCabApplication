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
exports.CabController = void 0;
class CabController {
    constructor(cabService) {
        this.cabService = cabService;
    }
    getPendingRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requests = yield this.cabService.getPendingRequests();
                res.json({
                    status: 'success',
                    data: requests,
                    message: 'Pending requests retrieved successfully'
                });
            }
            catch (error) {
                console.error("Error fetching requests:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    getAvailableDrivers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const drivers = yield this.cabService.getAvailableDrivers();
                res.json({
                    status: 'success',
                    data: drivers,
                    message: 'Available drivers retrieved successfully'
                });
            }
            catch (error) {
                console.error("Error fetching available drivers:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    assignDriver(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { requestIds, driverId, vehicleId } = req.body;
            try {
                const success = yield this.cabService.assignDriver(requestIds, driverId, vehicleId);
                if (!success) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'ASSIGNMENT_FAILED', message: 'Driver not available or not found' }
                    });
                    return;
                }
                res.json({
                    status: 'success',
                    message: 'Driver assigned successfully'
                });
            }
            catch (error) {
                console.error("Error assigning driver:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    cancelRide(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { employeeId, requestId } = req.body;
            try {
                const success = yield this.cabService.cancelRide(employeeId, requestId);
                if (!success) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'CANCELLATION_FAILED', message: 'Failed to cancel ride' }
                    });
                    return;
                }
                res.json({
                    status: 'success',
                    message: 'Ride cancelled successfully'
                });
            }
            catch (error) {
                console.error("Error canceling ride:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    updateDriverAvailability(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { driverId, available } = req.body;
            try {
                const success = yield this.cabService.updateDriverAvailability(driverId, available);
                if (!success) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'UPDATE_FAILED', message: 'Failed to update availability' }
                    });
                    return;
                }
                res.json({
                    status: 'success',
                    message: 'Driver availability updated'
                });
            }
            catch (error) {
                console.error("Error updating driver availability:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    getCabDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { date, timeSlot } = req.query;
            try {
                if (!date || !timeSlot) {
                    res.status(400).json({
                        status: 'error',
                        errors: { code: 'MISSING_PARAMS', message: 'Date and Time Slot are required' }
                    });
                    return;
                }
                const cabData = yield this.cabService.getCabDetails(date, timeSlot);
                if (!cabData) {
                    res.status(404).json({
                        status: 'error',
                        errors: { code: 'NOT_FOUND', message: 'No assigned cab details found' }
                    });
                    return;
                }
                res.json({
                    status: 'success',
                    data: cabData,
                    message: 'Cab details retrieved successfully'
                });
            }
            catch (error) {
                console.error("Error fetching cab details:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    checkEmployeeBooking(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeId } = req.query;
                const result = yield this.cabService.checkEmployeeBooking(Number(employeeId));
                res.status(200).json({
                    status: 'success',
                    data: result,
                    message: 'Booking status retrieved successfully'
                });
            }
            catch (error) {
                console.error("Error checking booking status:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    bookRide(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { employeeId, routeId, timeSlot, date } = req.body;
                const result = yield this.cabService.bookRide(Number(employeeId), routeId, timeSlot, date);
                res.status(201).json({
                    status: 'success',
                    data: result,
                    message: 'Ride booked successfully'
                });
            }
            catch (error) {
                console.error("Error booking ride:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
    completeRide(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { requestId } = req.params;
                const result = yield this.cabService.completeRide(Number(requestId));
                res.status(200).json({
                    status: 'success',
                    data: result,
                    message: 'Ride marked as completed'
                });
            }
            catch (error) {
                console.error("Error updating ride status:", error);
                res.status(500).json({
                    status: 'error',
                    errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
                });
            }
        });
    }
}
exports.CabController = CabController;
