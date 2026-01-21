export interface Driver {
    id?: number;
    name: string;
    phone: string;
    licenseNumber: string;
    available: boolean;
  }

  export interface driverAvailable{
    driverId:number;
    isAvailable:boolean;
    date: Date;
   
  }