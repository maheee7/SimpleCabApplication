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
exports.CabService = void 0;
class CabService {
    constructor(cabRepository) {
        this.cabRepository = cabRepository;
    }
    getPendingRequests() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.getPendingRequests();
        });
    }
    getAvailableDrivers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.getAvailableDrivers();
        });
    }
    assignDriver(requestIds, driverId, vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.assignDriver(requestIds, driverId, vehicleId);
        });
    }
    cancelRide(employeeId, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.cancelRide(employeeId, requestId);
        });
    }
    updateDriverAvailability(driverId, available) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.updateDriverAvailability(driverId, available);
        });
    }
    getCabDetails(date, timeSlot) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.getCabDetails(date, timeSlot);
        });
    }
    checkEmployeeBooking(employeeId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(employeeId, "from service");
            return yield this.cabRepository.checkEmployeeBooking(employeeId);
        });
    }
    // Book a ride for an employee
    bookRide(employeeId, routeId, timeSlot, date) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.bookRide(employeeId, routeId, timeSlot, date);
        });
    }
    // Mark a ride as completed
    completeRide(requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cabRepository.completeRide(requestId);
        });
    }
}
exports.CabService = CabService;
