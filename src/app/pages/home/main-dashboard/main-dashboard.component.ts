import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { MqttService } from '../../../services/mqtt.service';
import { AuthService } from '../../../services/auth.service';
import { NzAlertModule } from 'ng-zorro-antd/alert';

export interface tank {
  tankname: string;
  level: number;
  status: string;
}

@Component({
  selector: 'app-main-dashboard',
  imports: [NzProgressModule,NzAlertModule,
    NzSwitchModule, NzTableModule,
    CommonModule,
    NzCardModule,
    NzMenuModule,
    NzLayoutModule,
    NzIconModule,
    NzBreadCrumbModule,
    RouterModule],
  templateUrl: './main-dashboard.component.html',
  styleUrl: './main-dashboard.component.css'
})
export class MainDashboardComponent implements OnInit {
  devices: any[] = [];
  aiValues: number[] = []
  selectedUUID: string | null = null;

  data: any = {};

  constructor(private eRef: ElementRef, private auth: AuthService, private router: Router, private message: NzMessageService, public Mqtt: MqttService
  ) { }



  ngOnInit(): void {
    this.loadDevices(),
      setInterval(() => {
        this.updateDeviceData();
      }, 1000);
  }

  loadDevices(): void {
    this.auth.getDevices().subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        if (res.success && Array.isArray(res.data)) {
          this.devices = res.data;
          res.data.forEach((device:any) => {
              this.data[device.id] = {
                level:null,
                pumpStatus:null
              }
          });
          this.Mqtt.connect(res.data);
        } else {
          this.message.warning('No devices found.');
        }
      },
      error: (err) => {
        console.error('Error fetching devices:', err);
        this.message.error('Failed to load devices.');
      }
    });
  }

  updateDeviceData(): void {
    this.devices.forEach(device => {
      const deviceData = this.Mqtt.data[device.uuid];
      this.data[device.id].level = deviceData.level;
      this.data[device.id].pumpStatus = deviceData.pumpStatus;

      if (Array.isArray(deviceData.ai)) {
        this.data[device.id].aiValues = deviceData.ai;
      }

      console.log('Level:', this.data[device.id].level, 'Pump Status:', this.data[device.id].pumpStatus);
    
  });
  }
  
  isPumpOn(id:number): boolean {
    return this.data[id].pumpStatus === 1;
  }

  openDevice(id: number) {
    this.router.navigate(['/dashboard', id])
  }



}
