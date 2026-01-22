// src/route/driver.route.ts
import express from 'express';
import { DriverController } from '../controller/driver.controller';
import { DriverService } from '../service/driver.service';
import { DriverRepository } from '../repository/driver.repository';

const router = express.Router();

// Instantiate controller with dependencies
const driverRepository = new DriverRepository();
const driverService = new DriverService(driverRepository);
const driverController = new DriverController(driverService);

// Specific routes FIRST
router.post('/availability', (req, res) => driverController.availableDriver(req, res));
router.get('/check-availability/:driverId', (req, res) => driverController.checkDriverAvailability(req, res));
router.post('/complete-trip', (req, res) => driverController.completeTrip(req, res));
router.get('/trip/:driverId', (req, res) => driverController.getAssignedEmployees(req, res));

// General routes LAST
router.post('/', (req, res) => driverController.createDriver(req, res));
router.get('/', (req, res) => driverController.getDrivers(req, res));
router.put('/:id', (req, res) => driverController.updateDriver(req, res));

export default router;
