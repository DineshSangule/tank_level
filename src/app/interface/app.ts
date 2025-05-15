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
    id?: number;
    name: string;
}

