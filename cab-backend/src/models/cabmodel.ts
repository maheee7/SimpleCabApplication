export interface CabBooking {
    id?: number;
    employeeId: number;
    route: string;
    timeSlot: string;
    status?: string; // pending, allocated, completed
  }
  export interface RideRequest {
    id: number;
    employee_id: number;
    driver_id: number | null;
    status: string;
    created_at: Date;
  }
  