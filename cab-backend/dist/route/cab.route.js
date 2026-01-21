"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cab_controller_1 = require("../controller/cab.controller");
const router = express_1.default.Router();
// ✅ No need for an extra wrapper function
router.get("/admin/pending-requests", cab_controller_1.cabController.getPendingRequests);
router.post("/employee/cancel-ride", cab_controller_1.cabController.cancelRide);
router.post("/driver/update-drivers", cab_controller_1.cabController.updateDriverAvailability);
router.get("/admin/available-driver", cab_controller_1.cabController.getAvailableDrivers);
router.post("/admin/assign-driver", cab_controller_1.cabController.assignDriver);
router.get("/cab-details", cab_controller_1.cabController.getCabDetails);
router.get("/check-booking", cab_controller_1.cabController.checkEmployeeBooking);
// Book a ride for an employee
router.post("/book-ride", cab_controller_1.cabController.bookRide);
// Mark ride as completed by driver
router.put("/driver/complete-ride/:requestId", cab_controller_1.cabController.completeRide);
exports.default = router;
