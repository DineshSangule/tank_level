import { Component, Inject, OnInit, PLATFORM_ID,AfterViewInit, Input } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { MqttService } from '../../../services/mqtt.service';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import * as L from 'leaflet';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzInputModule, NzToolTipModule, NzCollapseModule, FormsModule, NzDatePickerModule, NzTableModule, CommonModule,NzAlertModule, NzTabsModule, NzStatisticModule, NzTimePickerModule, CommonModule, NzCardModule, NzFormModule, NzLayoutModule, NzIconModule, NzSwitchModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,AfterViewInit {
  sensorFault: boolean = false;
  aiValues: number[] = []
  selectedUUID: string | null = null;
  level: number = 0;
  pumpStatus: number = 0;
  private isBrowser: boolean;
  private map: any;
  device_id: number = 0;
  device: any = {};
  data:any = undefined;
  lastReceivedTime: string = '';
  lastReceivedTimestamp: number = 0;
deviceOnline: boolean = false;



  constructor(private route: ActivatedRoute, private router: Router, public mqtt: MqttService, private reportService: AuthService,
    private message: NzMessageService,     @Inject(PLATFORM_ID) private platformId: Object
) {
      this.isBrowser = isPlatformBrowser(platformId);

    this.route.params.subscribe((param) => {
      console.log( param['id'] || this.mqtt.devices[this.device_id]);
      if (!param['id']) 
        {
          this.router.navigate(["/maindashboard"]);
        }
      this.device_id = param['id'];
      console.log(this.device_id,this.mqtt.devices)
      this.device = this.mqtt.devices[this.device_id];
      if (!this.device) 
        {
          this.router.navigate(["/maindashboard"]);
        }
    })
  }

  ngOnInit(): void {

    setInterval(() => {
      this.updateDeviceData();
    }, 1000);
  }

updateDeviceData(): void {
  console.log('Selected Device:', this.device?.name || this.device?.deviceName);

  if (this.device && !this.device.uuid) {
    const keys = Object.keys(this.mqtt.data);
    if (keys.length > 0) {
      this.device.uuid = keys[0];
    }
  }

  if (this.device?.uuid && this.mqtt.data[this.device.uuid]) {
    this.data = this.mqtt.data[this.device.uuid];
    this.level = this.data.level;
    this.pumpStatus = this.data.pumpStatus;

    if (Array.isArray(this.data.ai)) {
      this.aiValues = this.data.ai;
    }

    // Save timestamp of last data received
    this.lastReceivedTimestamp = Date.now();
    this.lastReceivedTime = new Date(this.lastReceivedTimestamp).toLocaleString();
    this.deviceOnline = true;

    console.log('Device Name:', this.device?.name || this.device?.deviceName);
    console.log('Level:', this.level, 'Pump Status:', this.pumpStatus);
    console.log('Last Received:', this.lastReceivedTime);
  }
}



  isPumpOn(): boolean {
    return this.pumpStatus === 1;
  }

  getMarkers() {
    return [
      {
        bottom: '20%',
        isFault: (this.level >= 20 && this.aiValues[0] <= 0),
        color: (this.level >= 20)
          ? (this.aiValues[0] > 0 ? 'green' : 'red')
          : '#ccc'
      },
      {
        bottom: '40%',
        isFault: (this.level >= 40 && this.aiValues[1] <= 0),
        color: (this.level >= 40)
          ? (this.aiValues[1] > 0 ? 'green' : 'red')
          : '#ccc'
      },
      {
        bottom: '60%',
        isFault: (this.level >= 60 && this.aiValues[2] <= 0),
        color: (this.level >= 60)
          ? (this.aiValues[2] > 0 ? 'green' : 'red')
          : '#ccc'
      },
      {
        bottom: '80%',
        isFault: (this.level >= 80 && this.aiValues[3] <= 0),
        color: (this.level >= 80)
          ? (this.aiValues[3] > 0 ? 'green' : 'red')
          : '#ccc'
      },
      {
        bottom: '97.5%',
        isFault: (this.level >= 98 && this.aiValues[4] <= 0),
        color: (this.level >= 98)
          ? (this.aiValues[4] > 0 ? 'green' : 'red')
          : '#ccc'
      }
    ];
  }


  isTankEmpty(): boolean {
    return this.aiValues.slice(0, 5).every(value => value === 0);
  }

  //scheduling 

  onClickSecheduling() {
    this.router.navigate(['scheduling']);
  }

  onClickReports() {
    this.router.navigate(['/reports']);
  }
  timeSlots = [
    {
      enabled: false,
      onTime: null,
      offTime: null
    }
  ];

  addTimeSlot() {
    this.timeSlots.push({
      enabled: false,
      onTime: null,
      offTime: null
    });
  }

  submitTimeSlot(index: number) {
    const slot = this.timeSlots[index];
    console.log(`Slot ${index + 1} submitted`, slot);
  }


  //reports

  dailyDeviceId = 1;
  dailyFromDate = '';
  dailyToDate = '';
  dailyReports: any[] = [];

  monthlyDeviceId = 1;
  monthlyFromDate = '';
  monthlyToDate = '';
  monthlyReports: any[] = [];



  fetchDailyReports(): void {
    if (!this.dailyDeviceId || !this.dailyFromDate || !this.dailyToDate) {
      this.message.warning('Please select all fields for daily report');
      return;
    }

    this.reportService.getReports(this.dailyDeviceId, this.dailyFromDate, this.dailyToDate)
      .subscribe({
        next: (res) => {
          console.log('Daily Report API Response:', res);
          if (res.success) {
            this.dailyReports = Array.isArray(res.data) ? res.data : res.data?.daily || [];
            this.message.success('Daily reports fetched successfully');
          } else {
            this.message.error('No daily reports found');
          }
        },
        error: (err) => {
          console.error('Error fetching daily reports:', err);
          this.message.error('Error fetching daily reports');
        }
      });
  }

  fetchMonthlyReports(): void {
    if (!this.monthlyDeviceId || !this.monthlyFromDate || !this.dailyToDate) {
      this.message.warning('Please select all fields for monthly report');
      return;
    }

    this.reportService.getMonthReports(this.monthlyDeviceId, this.monthlyFromDate, this.dailyToDate)
      .subscribe({
        next: (res) => {
          console.log('Monthly Report API Response:', res);
          if (res.success) {
            this.monthlyReports = Array.isArray(res.data) ? res.data : res.data?.monthly || [];
            this.message.success('Monthly reports fetched successfully');
          } else {
            this.message.error('No monthly reports found');
          }
        },
        error: (err) => {
          console.error('Error fetching monthly reports:', err);
          this.message.error('Error fetching monthly reports');
        }
      });
  }

  switches = [
    { label: 'Switch 1', state: false },
    { label: 'Switch 2', state: false },
    { label: 'Switch 3', state: false }
  ];

  onToggle(index: number, newState: boolean) {
    console.log(`${this.switches[index].label} is now ${newState ? 'ON' : 'OFF'}`);
  }




  turnOnClick(): void {
    alert('Do you want to turn the motor ON?');
  }

  //config section

  panel = [
    { name: 'Edit Device', active: false, arrow: true }
  ];


  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initMap();
      }, 0);
    }
  }

  private async initMap(): Promise<void> {
  const L = await import('leaflet');

  this.map = L.map('map', {
    center: [18.5910, 73.7396],
    zoom: 25,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(this.map);

  const redIcon = L.icon({
    iconUrl: 'off.png',

    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [70,50],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const marker = L.marker([18.5910, 73.7396], { icon: redIcon }).addTo(this.map);


  marker.bindTooltip(() => {
    return `
      <b>Device Info</b><br>
      Level: ${this.level}<br>
      Pump Status: ${this.pumpStatus === 1 ? 'ON' : 'OFF'}
    `;
  }, { direction: 'top', sticky: true });

  setInterval(() => {
    marker.setTooltipContent(`
      <b>Device Info</b><br>
      Pump Status: ${this.pumpStatus === 1 ? 'ON' : 'OFF'}
    `);
  }, 1000);
}
  toggleSwitch(switch_id: number, value: number) {
    this.data['do'][switch_id-1] = undefined;
    const data = {
      type: "control",
      id: 1,
      key: switch_id,
      value
    };
    this.mqtt.publish(this.device.uuid, JSON.stringify(data));
  }


}

