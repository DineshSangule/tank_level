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
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FormsModule } from '@angular/forms';
import { OrderByOnlinePipe } from '../../../pipes/order-by-online.pipe';
import { ChangeDetectorRef } from '@angular/core';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

export interface tank {
  tankname: string;
  level: number;
  status: string;
}

@Component({
   standalone: true,
  selector: 'app-main-dashboard',
  imports: [NzProgressModule,NzAlertModule,
    NzSwitchModule, NzTableModule,NzToolTipModule,
    CommonModule,
    NzCardModule,
    NzMenuModule,
    NzLayoutModule,
    NzIconModule,
    NzBreadCrumbModule,
    RouterModule,
    NzSpinModule,
    FormsModule,
    OrderByOnlinePipe],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.css'] // ✅ PLURAL

})
export class MainDashboardComponent implements OnInit {
  devices: any[] = [];
  aiValues: number[] = []
  selectedUUID: string | null = null;

  data: any = {};

  constructor(private eRef: ElementRef, private auth: AuthService, private router: Router, private message: NzMessageService, public Mqtt: MqttService,  private cdr: ChangeDetectorRef

  ) { }

    isLoaded = true;


 ngOnInit(): void {
  this.loadDevices();

  this.Mqtt.message().subscribe((msg) => {
    this.data = msg;
    this.isLoaded = true;
    this.cdr.detectChanges(); // <-- Force Angular to re-evaluate the sorted list

  });

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
    if (!deviceData) return;

    // Ensure device data object exists
    if (!this.data[device.id]) {
      this.data[device.id] = {};
    }
      this.cdr.detectChanges();


    this.data[device.id].level = deviceData.level;
    this.data[device.id].pumpStatus = deviceData.pumpStatus;

    if (Array.isArray(deviceData.ai)) {
      this.data[device.id].aiValues = deviceData.ai;
    }

    if (Array.isArray(deviceData.do)) {
      this.data[device.id].do = deviceData.do;
    }

    console.log(`Device ID: ${device.id}`);
    console.log('Level:', this.data[device.id].level);
    console.log('Pump Status:', this.data[device.id].pumpStatus);
  });
}

  
  isPumpOn(id:number): boolean {
    return this.data[id].pumpStatus === 1;
  }

  openDevice(id: number) {
    this.router.navigate(['/dashboard', id])
  }


}
