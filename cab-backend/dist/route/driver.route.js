"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/route/driver.route.ts
const express_1 = __importDefault(require("express"));
const driver_controller_1 = require("../controller/driver.controller");
const router = express_1.default.Router();
// Specific routes FIRST
router.post('/availability', driver_controller_1.availableDriver);
router.get('/check-availability/:driverId', driver_controller_1.checkDriverAvailability);
router.post('/complete-trip', driver_controller_1.completeTrip);
router.get('/trip/:driverId', driver_controller_1.getAssignedEmployees);
// General routes LAST
router.post('/', driver_controller_1.createDriver);
router.get('/', driver_controller_1.getDrivers);
router.put('/:id', driver_controller_1.updateDriver);
exports.default = router;
