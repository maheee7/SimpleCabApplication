// src/controller/driver.controller.ts
import { Request, Response } from 'express';
import { DriverService } from '../service/driver.service';

export class DriverController {
  private driverService: DriverService;

  constructor(driverService: DriverService) {
    this.driverService = driverService;
  }

  async createDriver(req: Request, res: Response) {
    try {
      await this.driverService.createDriver(req.body);
      res.status(201).json({
        status: 'success',
        message: 'Driver added successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async getDrivers(req: Request, res: Response) {
    try {
      const drivers = await this.driverService.getDrivers();
      res.status(200).json({
        status: 'success',
        data: drivers,
        message: 'Drivers retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async updateDriver(req: Request, res: Response) {
    try {
      await this.driverService.updateDriver(Number(req.params.id), req.body);
      res.json({
        status: 'success',
        message: 'Driver updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async availableDriver(req: Request, res: Response) {
    try {
      const result = await this.driverService.availableDriver(req.body);
      res.json({
        status: 'success',
        data: result,
        message: 'Driver availability updated'
      });
    } catch (error) {
      console.error("availableDriver error:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async checkDriverAvailability(req: Request, res: Response) {
    try {
      const driverId = Number(req.params.driverId);

      if (isNaN(driverId)) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'INVALID_ID', message: 'Invalid driver ID' }
        });
        return;
      }

      const availability = await this.driverService.getDriverAvailability(driverId);
      res.status(200).json({
        status: 'success',
        data: availability,
        message: 'Driver availability retrieved'
      });
    } catch (error) {
      console.error("Error checking driver availability:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async getAssignedEmployees(req: Request, res: Response) {
    try {
      const driverId = parseInt(req.params.driverId, 10);

      if (isNaN(driverId)) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'INVALID_ID', message: 'Invalid driver ID' }
        });
        return
      }

      const assignedEmployees = await this.driverService.getEmployeesByDriverId(driverId);
      res.status(200).json({
        status: 'success',
        data: assignedEmployees,
        message: 'Assigned employees retrieved successfully'
      });
    } catch (error) {
      console.error("Error fetching assigned employees:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async completeTrip(req: Request, res: Response): Promise<void> {
    try {
      const { driverId, trip_id } = req.body;

      if (!driverId || !trip_id) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_PARAMS', message: 'Driver ID and Trip ID are required' }
        });
        return
      }

      await this.driverService.completeTrip(driverId, trip_id);
      res.status(200).json({
        status: 'success',
        message: 'Trip marked as completed'
      });
    } catch (error) {
      console.error("Error marking trip as completed:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }
}

