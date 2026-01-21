// src/controller/driver.controller.ts
import { Request, Response } from 'express';
import { DriverService } from '../service/driver.service';
import { DriverRepository } from '../repository/driver.repository';

const driverService = new DriverService(new DriverRepository());

export const createDriver = async (req: Request, res: Response) => {
  try {
    await driverService.createDriver(req.body);
    res.status(201).json({ message: 'Driver added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await driverService.getDrivers();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    await driverService.updateDriver(Number(req.params.id), req.body);
    res.json({ message: 'Driver updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const availableDriver = async (req: Request, res: Response) => {
  try {
    console.log("=== availableDriver controller called ===");
    console.log("Request body:", req.body);
    
    const result = await driverService.availableDriver(req.body);
    
    console.log("Service returned:", result);
    res.json({ message: 'Driver currently available', result });
  } catch (error) {
    console.error("=== availableDriver controller ERROR ===");
    console.error("Error:", error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};

export const getAssignedEmployees = async (req: Request, res: Response) : Promise<any> => {
  try {
    const driverId = parseInt(req.params.driverId, 10);
    
    if (isNaN(driverId)) {
      return res.status(400).json({ message: "Invalid driver ID" });
    }

    const assignedEmployees = await driverService.getEmployeesByDriverId(driverId);

    return res.status(200).json(assignedEmployees);
  } catch (error) {
    console.error("Error fetching assigned employees:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const completeTrip = async (req: Request, res: Response): Promise<any> => {
  try {
    const { driverId, trip_id} = req.body;

    console.log(driverId, trip_id,req.body);
    if (!driverId || !trip_id) {
      return res.status(400).json({ message: "Driver ID and Trip ID are required." });
    }
   console.log(driverId, trip_id);
   
    await driverService.completeTrip(driverId, trip_id);

    return res.status(200).json({ message: "Trip marked as completed. Driver is now available." });
  } catch (error) {
    console.error("Error marking trip as completed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

