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
      res.json({
        status: 'success',
        data: requests,
        message: 'Pending requests retrieved successfully'
      });
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async getAvailableDrivers(req: Request, res: Response) {
    try {
      const drivers = await this.cabService.getAvailableDrivers();
      res.json({
        status: 'success',
        data: drivers,
        message: 'Available drivers retrieved successfully'
      });
    } catch (error) {
      console.error("Error fetching available drivers:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async assignDriver(req: Request, res: Response) {
    const { requestIds, driverId, vehicleId } = req.body;
    try {
      const success = await this.cabService.assignDriver(requestIds, driverId, vehicleId);
      if (!success) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'ASSIGNMENT_FAILED', message: 'Driver not available or not found' }
        });
        return;
      }
      res.json({
        status: 'success',
        message: 'Driver assigned successfully'
      });
    } catch (error) {
      console.error("Error assigning driver:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async cancelRide(req: Request, res: Response) {
    const { employeeId, requestId } = req.body;
    try {
      const success = await this.cabService.cancelRide(employeeId, requestId);
      if (!success) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'CANCELLATION_FAILED', message: 'Failed to cancel ride' }
        });
        return
      }
      res.json({
        status: 'success',
        message: 'Ride cancelled successfully'
      });
    } catch (error) {
      console.error("Error canceling ride:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async updateDriverAvailability(req: Request, res: Response) {
    const { driverId, available } = req.body;
    try {
      const success = await this.cabService.updateDriverAvailability(driverId, available);
      if (!success) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'UPDATE_FAILED', message: 'Failed to update availability' }
        });
        return;
      }
      res.json({
        status: 'success',
        message: 'Driver availability updated'
      });
    } catch (error) {
      console.error("Error updating driver availability:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async getCabDetails(req: Request, res: Response) {
    const { date, timeSlot } = req.query;

    try {
      if (!date || !timeSlot) {
        res.status(400).json({
          status: 'error',
          errors: { code: 'MISSING_PARAMS', message: 'Date and Time Slot are required' }
        });
        return;
      }

      const cabData = await this.cabService.getCabDetails(date as string, timeSlot as string);
      if (!cabData) {
        res.status(404).json({
          status: 'error',
          errors: { code: 'NOT_FOUND', message: 'No assigned cab details found' }
        });
        return;
      }

      res.json({
        status: 'success',
        data: cabData,
        message: 'Cab details retrieved successfully'
      });
    } catch (error) {
      console.error("Error fetching cab details:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async checkEmployeeBooking(req: Request, res: Response) {
    try {
      const { employeeId } = req.query;
      const result = await this.cabService.checkEmployeeBooking(Number(employeeId));
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Booking status retrieved successfully'
      });
    } catch (error) {
      console.error("Error checking booking status:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async bookRide(req: Request, res: Response) {
    try {
      const { employeeId, routeId, timeSlot, date } = req.body;
      const result = await this.cabService.bookRide(Number(employeeId), routeId, timeSlot, date);
      res.status(201).json({
        status: 'success',
        data: result,
        message: 'Ride booked successfully'
      });
    } catch (error) {
      console.error("Error booking ride:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }

  async completeRide(req: Request, res: Response) {
    try {
      const { requestId } = req.params;
      const result = await this.cabService.completeRide(Number(requestId));
      res.status(200).json({
        status: 'success',
        data: result,
        message: 'Ride marked as completed'
      });
    } catch (error) {
      console.error("Error updating ride status:", error);
      res.status(500).json({
        status: 'error',
        errors: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal Server Error' }
      });
    }
  }
}
