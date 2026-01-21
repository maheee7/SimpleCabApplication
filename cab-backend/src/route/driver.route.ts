// src/route/driver.route.ts
import express from 'express';
import { availableDriver, checkDriverAvailability, completeTrip, createDriver, getAssignedEmployees,  getDrivers, updateDriver } from '../controller/driver.controller';

const router = express.Router();

// Specific routes FIRST
router.post('/availability', availableDriver);
router.get('/check-availability/:driverId', checkDriverAvailability);
router.post('/complete-trip', completeTrip);
router.get('/trip/:driverId', getAssignedEmployees);

// General routes LAST
router.post('/', createDriver);
router.get('/', getDrivers);
router.put('/:id', updateDriver);

export default router;
