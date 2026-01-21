import { DriverRepository } from '../repository/driver.repository';
import { Driver, driverAvailable } from '../models/driverModel';

export class DriverService {
  private driverRepository: DriverRepository;

  constructor(driverRepository: DriverRepository) {
    this.driverRepository = driverRepository;
  }

  async createDriver(driver: Driver): Promise<void> {
    await this.driverRepository.createDriver(driver);
  }

  async getDrivers(): Promise<Driver[]> {
    return await this.driverRepository.getDrivers();
  }

  async updateDriver(id: number, driver: Driver): Promise<void> {
    await this.driverRepository.updateDriver(id, driver);
  }

  async availableDriver( driver: driverAvailable): Promise<void> {
    await this.driverRepository.availableDriver( driver);
  }
  async getEmployeesByDriverId (driverId: number) : Promise<void>{
    return await this.driverRepository.getEmployeesForDriver(driverId);
  };
     async completeTrip (driverId: number, tripId: number): Promise<void> {
    return await this.driverRepository.completeTrip(driverId, tripId);
  };
}

