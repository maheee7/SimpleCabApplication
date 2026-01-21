import { CabRepository } from "../repository/cab.repository";

export class CabService {
  private cabRepository: CabRepository;

  constructor(cabRepository: CabRepository) {
    this.cabRepository = cabRepository;
  }

  public async getPendingRequests() {
    return await this.cabRepository.getPendingRequests();
  }

  public async getAvailableDrivers() {
    return await this.cabRepository.getAvailableDrivers();
  }

  public async assignDriver(requestIds: number[], driverId: number,vehicleId : number) {
    return await this.cabRepository.assignDriver(requestIds, driverId,vehicleId);
  }

 

  public async cancelRide(employeeId: number, requestId: number) {
    return await this.cabRepository.cancelRide(employeeId, requestId);
  }

  public async updateDriverAvailability(driverId: number, available: boolean) {
    return await this.cabRepository.updateDriverAvailability(driverId, available);
  }
  public async getCabDetails(date: string, timeSlot: string) {
    return await this.cabRepository.getCabDetails(date, timeSlot);
  }
  public async checkEmployeeBooking(employeeId: number) {
    console.log(employeeId,"from service");
    
    return await this.cabRepository.checkEmployeeBooking(employeeId);
  }

  // Book a ride for an employee
  public async bookRide(employeeId: number, routeId: number, timeSlot: string, date: string) {
    return await this.cabRepository.bookRide(employeeId, routeId, timeSlot, date);
  }

  // Mark a ride as completed
  public async completeRide(requestId: number) {
    return await this.cabRepository.completeRide(requestId);
  }

}
