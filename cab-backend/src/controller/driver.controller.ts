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
      res.status(201).json({ message: 'Driver added successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }

  async getDrivers(req: Request, res: Response) {
    try {
      const drivers = await this.driverService.getDrivers();
      res.status(200).json(drivers);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }

  async updateDriver(req: Request, res: Response) {
    try {
      await this.driverService.updateDriver(Number(req.params.id), req.body);
      res.json({ message: 'Driver updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }

  async availableDriver(req: Request, res: Response) {
    try {
      console.log("=== availableDriver controller called ===");
      console.log("Request body:", req.body);
      
      const result = await this.driverService.availableDriver(req.body);
      
      console.log("Service returned:", result);
      res.json({ message: 'Driver currently available', result });
    } catch (error) {
      console.error("=== availableDriver controller ERROR ===");
      console.error("Error:", error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  }

  async checkDriverAvailability(req: Request, res: Response) {
    try {
      const driverId = Number(req.params.driverId);
      
      if (isNaN(driverId)) {
        res.status(400).json({ message: "Invalid driver ID" });
        return;
      }
      
      console.log("Checking availability for driver:", driverId);
      const availability = await this.driverService.getDriverAvailability(driverId);
      
      res.status(200).json(availability);
    } catch (error) {
      console.error("Error checking driver availability:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async getAssignedEmployees(req: Request, res: Response) {
    try {
      const driverId = parseInt(req.params.driverId, 10);
      
      if (isNaN(driverId)) {
        res.status(400).json({ message: "Invalid driver ID" });
        return
      }

      const assignedEmployees = await this.driverService.getEmployeesByDriverId(driverId);

       res.status(200).json(assignedEmployees);
    } catch (error) {
      console.error("Error fetching assigned employees:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async completeTrip(req: Request, res: Response) : Promise<void> {
    try {
      const { driverId, trip_id} = req.body;

      console.log(driverId, trip_id,req.body);
      if (!driverId || !trip_id) {
        res.status(400).json({ message: "Driver ID and Trip ID are required." });
        return
      }
     console.log(driverId, trip_id);
     
      await this.driverService.completeTrip(driverId, trip_id);

      res.status(200).json({ message: "Trip marked as completed. Driver is now available." });
    } catch (error) {
      console.error("Error marking trip as completed:", error);
       res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

