// src/route/driver.route.ts
import express from 'express';
import { availableDriver, completeTrip, createDriver, getAssignedEmployees,  getDrivers, updateDriver } from '../controller/driver.controller';

const router = express.Router();
router.post('/', createDriver);
router.get('/', getDrivers);
router.put('/:id', updateDriver);
router.post('/availability',availableDriver);
router.get('/trip/:driverId',getAssignedEmployees );
router.post('/complete-trip',completeTrip );
export default router;
