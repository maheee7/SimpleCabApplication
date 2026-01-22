"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/route/driver.route.ts
const express_1 = __importDefault(require("express"));
const driver_controller_1 = require("../controller/driver.controller");
const driver_service_1 = require("../service/driver.service");
const driver_repository_1 = require("../repository/driver.repository");
const router = express_1.default.Router();
// Instantiate controller with dependencies
const driverRepository = new driver_repository_1.DriverRepository();
const driverService = new driver_service_1.DriverService(driverRepository);
const driverController = new driver_controller_1.DriverController(driverService);
// Specific routes FIRST
router.post('/availability', (req, res) => driverController.availableDriver(req, res));
router.get('/check-availability/:driverId', (req, res) => driverController.checkDriverAvailability(req, res));
router.post('/complete-trip', (req, res) => driverController.completeTrip(req, res));
router.get('/trip/:driverId', (req, res) => driverController.getAssignedEmployees(req, res));
// General routes LAST
router.post('/', (req, res) => driverController.createDriver(req, res));
router.get('/', (req, res) => driverController.getDrivers(req, res));
router.put('/:id', (req, res) => driverController.updateDriver(req, res));
exports.default = router;
