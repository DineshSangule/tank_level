export interface Device{
    id?:number;
    deviceId: string;
    userId:string;
    deviceName:string;
    imei:string;
    area:string;
    startDate:Date;
    expiryDate:Date;
}
export interface User{
   id?: number;        // optional for new users before they get an ID
  userId: string;     // username
  name: string;
  password: string;
  mobile?: string; 
  role: string;
}

