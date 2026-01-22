import { Request, Response } from 'express';
import { CabService } from '../service/cab.service';

export class CabController {
  private cabService: CabService;

  constructor(cabService: CabService) {
    this.cabService = cabService;
  }

  async getPendingRequests(req: Request, res: Response) {
    try {
      const requests = await this.cabService.getPendingRequests();
      res.json({ success: true, data: requests });
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async getAvailableDrivers(req: Request, res: Response) {
    try {
      const drivers = await this.cabService.getAvailableDrivers();
      res.json({ success: true, data: drivers });
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async assignDriver(req: Request, res: Response) {
    const { requestIds, driverId, vehicleId } = req.body;
    try {
      const success = await this.cabService.assignDriver(requestIds, driverId, vehicleId);
      if (!success) {
        res.status(400).json({ success: false, message: "Driver not available or not found" });
        return;
      }
      res.json({ success: true, message: "Driver assigned successfully" });
    } catch (error) {
      console.error("Error assigning driver:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async cancelRide(req: Request, res: Response) {
    const { employeeId, requestId } = req.body;
    try {
      const success = await this.cabService.cancelRide(employeeId, requestId);
      if (!success) {
        res.status(400).json({ success: false, message: "Failed to cancel ride" });
        return
      }
      res.json({ success: true, message: "Ride cancelled successfully" });
    } catch (error) {
      console.error("Error canceling ride:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async updateDriverAvailability(req: Request, res: Response) {
    const { driverId, available } = req.body;
    try {
      const success = await this.cabService.updateDriverAvailability(driverId, available);
      if (!success) {
         res.status(400).json({ success: false, message: "Failed to update availability" });
         return;
      }
      res.json({ success: true, message: "Driver availability updated" });
    } catch (error) {
      console.error("Error updating driver availability:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async getCabDetails(req: Request, res: Response) {
    const { date, timeSlot } = req.query;

    try {
      if (!date || !timeSlot) {
      res.status(400).json({ success: false, message: "Date and Time Slot are required" });
      return;
      }

      const cabData = await this.cabService.getCabDetails(date as string, timeSlot as string);
      if (!cabData) {
        res.status(404).json({ success: false, message: "No assigned cab details found" });
        return;
      }

      res.json({ success: true, assigned: true, data: cabData });
    } catch (error) {
      console.error("Error fetching cab details:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  async checkEmployeeBooking(req: Request, res: Response) {
    try {
      const { employeeId } = req.query;
      console.log(employeeId, "controller", Number(employeeId));
      
      const result = await this.cabService.checkEmployeeBooking(Number(employeeId));
      res.status(200).json(result);
    } catch (error) {
      console.error("Error checking booking status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async bookRide(req: Request, res: Response) {
    try {
      const { employeeId, routeId, timeSlot, date } = req.body;
      const result = await this.cabService.bookRide(Number(employeeId), routeId, timeSlot, date);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error booking ride:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async completeRide(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const result = await this.cabService.completeRide(Number(requestId));
      res.status(200).json(result);
    } catch (error) {
      console.error("Error updating ride status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}
