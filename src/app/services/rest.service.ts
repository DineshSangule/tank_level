import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { Device } from '../interface/app';
@Injectable({
  providedIn: 'root'
})
export class RestService {

  private apiUrl = 'http://localhost:3000/api/devices';

  constructor(private http: HttpClient) {}

  addDevice(device: Device): Observable<Device> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<Device>(this.apiUrl, device, { headers });
  }
  getDevices(): Observable<Device[]>
  {
    return this.http.get<Device[]>(this.apiUrl);
  }
  getDeviceByID(id:number): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/${id}`);

  }
}
