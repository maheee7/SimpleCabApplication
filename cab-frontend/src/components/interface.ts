export interface RideRequest {
    id: number;
    employee_id:number;
    employee_name: string;
    route_id:number;
    route_name: string;
    time_slot: string;
    date:string;
  }
  
  export interface Driver {
    driver_id: number;
    driver_name: string;
    available: boolean;
    vehicle_number:string;
    type:string;
    available_date:string;
    id: number;
  }