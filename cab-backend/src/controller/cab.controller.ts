import { Request, Response } from 'express';
import { CabService } from '../service/cab.service';
import { CabRepository } from '../repository/cab.repository';

const cabService = new CabService(new CabRepository());

export const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const requests = await cabService.getPendingRequests();
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAvailableDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await cabService.getAvailableDrivers();
    res.json({ success: true, data: drivers });
  } catch (error) {
    console.error("Error fetching available drivers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const assignDriver = async (req: Request, res: Response): Promise<any> => {
  const { requestIds, driverId, vehicleId } = req.body;
  try {
    const success = await cabService.assignDriver(requestIds, driverId, vehicleId);
    if (!success) {
      return res.status(400).json({ success: false, message: "Driver not available or not found" });
    }
    res.json({ success: true, message: "Driver assigned successfully" });
  } catch (error) {
    console.error("Error assigning driver:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const cancelRide = async (req: Request, res: Response): Promise<any> => {
  const { employeeId, requestId } = req.body;
  try {
    const success = await cabService.cancelRide(employeeId, requestId);
    if (!success) {
      return res.status(400).json({ success: false, message: "Failed to cancel ride" });
    }
    res.json({ success: true, message: "Ride cancelled successfully" });
  } catch (error) {
    console.error("Error canceling ride:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateDriverAvailability = async (req: Request, res: Response): Promise<any> => {
  const { driverId, available } = req.body;
  try {
    const success = await cabService.updateDriverAvailability(driverId, available);
    if (!success) {
      return res.status(400).json({ success: false, message: "Failed to update availability" });
    }
    res.json({ success: true, message: "Driver availability updated" });
  } catch (error) {
    console.error("Error updating driver availability:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getCabDetails = async (req: Request, res: Response): Promise<any> => {
  const { date, timeSlot } = req.query;

  try {
    if (!date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Date and Time Slot are required" });
    }

    const cabData = await cabService.getCabDetails(date as string, timeSlot as string);
    if (!cabData) {
      return res.status(404).json({ success: false, message: "No assigned cab details found" });
    }

    res.json({ success: true, assigned: true, data: cabData });
  } catch (error) {
    console.error("Error fetching cab details:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const checkEmployeeBooking = async (req: Request, res: Response): Promise<any> => {
  try {
    const { employeeId } = req.query;
    console.log(employeeId, "controller", Number(employeeId));
    
    const result = await cabService.checkEmployeeBooking(Number(employeeId));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error checking booking status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const bookRide = async (req: Request, res: Response): Promise<any> => {
  try {
    const { employeeId, routeId, timeSlot, date } = req.body;
    const result = await cabService.bookRide(Number(employeeId), routeId, timeSlot, date);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error booking ride:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const completeRide = async (req: Request, res: Response): Promise<any> => {
  try {
    const { requestId } = req.params;
    const result = await cabService.completeRide(Number(requestId));
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating ride status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
