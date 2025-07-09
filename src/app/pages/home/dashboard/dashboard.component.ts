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
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { IstTimePipe } from '../../../pipes/ist-time.pipe';

import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { saveAs } from 'file-saver'; // Warning will appear unless allowedCommonJsDependencies is set



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzButtonModule,NzSelectModule ,NzInputModule, NzToolTipModule, NzCollapseModule, FormsModule, NzDatePickerModule, NzTableModule, CommonModule,NzAlertModule, NzTabsModule, NzStatisticModule, NzTimePickerModule, CommonModule, NzCardModule, NzFormModule, NzLayoutModule, NzIconModule, NzSwitchModule,NzSpinModule,IstTimePipe ],
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
  device_id: number = 0;
  device: any = {};
  data:any = undefined;
  lastReceivedTime: string = '';
  lastReceivedTimestamp: number = 0;
  deviceOnline: boolean = false;
  private map!: Map;
  timeAgo: string = '';
  private timeInterval: any;
  timer: number | null = null;




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
    isAdmin = false;


  ngOnInit(): void {
        this.isAdmin = this.reportService.isAdmin(); 

     this.subscribeToMqtt();
     this.sendGetTime();

    setInterval(() => {
      this.updateDeviceData();
    }, 1000);

    this.timeInterval = setInterval(()=>
    {
      this.updateTimeAgo();
    },60000);
  }
  ngOnDestroy():void{
    clearInterval(this.timeInterval);
  }
  mcconfig: any = null;


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

     if(this.data.timer)this.timer = Number(this.data.timer);
      
    const tank = this.device.uuid;
    const tconfig = this.mqtt.data[tank];

    if (tank && tconfig?.config) {
      const configData = tconfig.config;

      if (configData.type === 'time' && configData.key === 'stime') {
        this.mcconfig = configData;
        console.log('🕒 Schedule Time Config Received:', this.mcconfig);

        if (Array.isArray(configData.value)) {
          configData.value.forEach((slot: string, index: number) => {
            const [idStr, enableStr, startStr, endStr] = slot.split(',');
            const from = this.convertMinutesToTime(+startStr);
            const to = this.convertMinutesToTime(+endStr);
            const enabled = enableStr === '1';
            console.log(`🔹 Slot ${index + 1}: ${enabled ? '✅ Enabled' : '❌ Disabled'} | ${from} → ${to}`);
          });
        } else {
          console.warn('⚠️ Invalid config.value format:', configData.value);
        }
      }
    }
     


    this.lastReceivedTimestamp = Date.now();
    this.lastReceivedTime = new Date(this.lastReceivedTimestamp).toLocaleString();

    this.deviceOnline = this.data['do'] !== undefined;
    this.updateTimeAgo();
    
    console.log('Device Name:', this.device?.name || this.device?.deviceName);
    console.log('Level:', this.level, 'Pump Status:', this.pumpStatus);
    console.log('Last Received:', this.lastReceivedTime);

    if (this.device?.latitude && this.device?.longitude) {
      console.log('Latitude:', this.device.latitude);
      console.log('Longitude:', this.device.longitude);
    } else {
      console.warn('Latitude or Longitude is missing in the selected device.');
    }
  }
}

updateTimeAgo(): void{
  if(!this.lastReceivedTimestamp)
  {
    this.timeAgo = '';
    return;
  }
  const now = Date.now();

  const diffMs = now - this.lastReceivedTimestamp;
  const diffMin = Math.floor(diffMs/60000);
  const diffHour = Math.floor(diffMin/60);
  const diffDay = Math.floor(diffHour/24);

  if(diffMin<1) this.timeAgo = 'few sec ago';
  else if (diffMin < 60) this.timeAgo = `${diffMin} min ago'`;
  else if(diffHour < 24) this.timeAgo = `${diffHour} hour${diffHour>1 ? 's' : ''}ago`;
  else this.timeAgo = `${diffDay} day${diffDay > 1 ? 's' : ''}ago`;
  
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
  const firstThree = this.aiValues.slice(0, 3);
  const nextTwo = this.aiValues.slice(3, 5);

  const firstThreeCondition = firstThree.every(value => value < 3);
  const nextTwoCondition = nextTwo.every(value => value === 0);

  return firstThreeCondition && nextTwoCondition;
}

  //scheduling 

  onClickSecheduling() {
    this.router.navigate(['scheduling']);
  }

  onClickReports() {
    this.router.navigate(['/reports']);
  }
 


  //reports

  dailyDeviceId = 0;
  dailyFromDate = '';
  dailyToDate = '';
  dailyReports: any[] = [];

  monthlyDeviceId = 1;
  monthlyFromDate = '';
  monthlyToDate = '';
  monthlyReports: any[] = [];



 fetchDailyReports(): void {
  if (!this.device_id || !this.dailyFromDate || !this.dailyToDate) {
    this.message.warning('Please select all fields for daily report');
    return;
  }

  this.reportService.getReports(this.device_id, this.dailyFromDate, this.dailyToDate)
    .subscribe({
      next: (res) => {
        console.log('Daily Report API Response:', res);
        if (res.success) {
          const reports = Array.isArray(res.data) ? res.data : res.data?.daily || [];
          this.dailyReports = reports;

          if (reports.length > 0 && reports[0].do) {
            this.data['do'] = reports[0].do;
            console.log("DO Values:", this.data['do']);
          } else {
            this.data['do'] = []; 
          }

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
    if (!this.device_id || !this.monthlyFromDate || !this.dailyToDate) {
      this.message.warning('Please select all fields for monthly report');
      return;
    }

    this.reportService.getMonthReports(this.device_id, this.monthlyFromDate, this.dailyToDate)
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

private initMap(): void {
  const lat = this.device?.lat;
  const lng = this.device?.lng;

  if (lat == null || lng == null) {
    console.warn('Latitude or Longitude is missing in the selected device.');
    return;
  }

  const iconFeature = new Feature({
    geometry: new Point(fromLonLat([lng, lat])),
    name: 'Device Location'
  });

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      src: 'off.png', 
      scale: 0.25 
    })
  });

  iconFeature.setStyle(iconStyle);

  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      features: [iconFeature]
    })
  });

  this.map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      }),
      vectorLayer
    ],
    view: new View({
      center: fromLonLat([lng, lat]),
      zoom: 17
    })
  });
}


  toggleSwitch(switch_id: number, value: number) {
  this.data['do'][switch_id-1] = undefined;
  console.log("do[0]:", this.data['do'][0]);
  console.log("do[1]:", this.data['do'][1]);
  console.log("do[2]:", this.data['do'][2]);
    const data = {
      type: "control",
      id: 1,
      key: switch_id,
      value
    };


    this.mqtt.publish(this.device.uuid, JSON.stringify(data));
  }
timeSlots = [
  { enabled: true, onTime: new Date(), offTime: new Date() }
];

addTimeSlot(): void {
  this.timeSlots.push({
    enabled: true,
    onTime: new Date(),
    offTime: new Date(),
  });
}
/* set Cammand Logic */
calculateMinutes(date: Date): number {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return hours * 60 + minutes;
}

submitTimeSlot(index: number): void {
  const slot = this.timeSlots[index];

  const id = index.toString().padStart(2, '0'); 
  const enable = slot.enabled ? '1' : '0';
  const on = this.calculateMinutes(slot.onTime);  
  const off = this.calculateMinutes(slot.offTime); 

  const payload = {
    type: 'config',
    id: 1,
    key: 'stime',
    value: `${id},${enable},${on},${off}`
  };

  console.log('Sending Slot:', payload);
  this.mqtt.publish(this.device.uuid, JSON.stringify(payload));
}

  timeValueMinutes: number | null = null;
  formattedTime: string = '';

convertMinutesToTime(value: number): string {
  const hours = Math.floor(value / 60).toString().padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}


sendGetConfig(): void {
  const cmdPayload = {
    type: 'command',
    id: 1,
    cmd: 'config'
  };

  console.log('Sending get_time:', cmdPayload);
  this.mqtt.publish(this.device.uuid, JSON.stringify(cmdPayload));
}

sendConfigRequest(): void {
  const cmdPayload = {
    type: 'command',
    id: 1,
    cmd: 'config'
  };

  const topic = `vidani/vl/${this.device.uuid}`;
  this.mqtt.publish(topic, JSON.stringify(cmdPayload));
}


fetchedSlot = {
  enabled: false,
  onTime: '',
  offTime: ''
};



subscribeToMqtt(): void {
  this.mqtt.message().subscribe(({ topic, message }) => {
    console.log('MQTT Message Received:', message); // Add this line

    try {
      const payload = JSON.parse(message);

      if (payload.type === 'response' && payload.cmd === 'get_time') {
        const valueArray = payload.value;

        if (Array.isArray(valueArray) && valueArray.length > 0) {
          const [enableStr, onStr, offStr] = valueArray[0].split(',');

          this.fetchedSlot.enabled = enableStr === '1';
          this.fetchedSlot.onTime = this.convertMinutesToTime(+onStr);
          this.fetchedSlot.offTime = this.convertMinutesToTime(+offStr);

          console.log('Fetched Slot:', this.fetchedSlot.offTime); // Confirm this prints correct values
          console.log('Fetched Slot:', this.fetchedSlot.onTime); // Confirm this prints correct values

        }
      }
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  });
}


  

 tankAlerts = [
  {
    enabled: false,
    level: 20,
    message: 'Tank is 20% full'
  }
];

levels = [20, 40, 60, 80, 100];

addAlert() {
  this.tankAlerts.push({
    enabled: true,
    level: 20,
    message: 'Tank is 20% full'
  });
}

onSensorChange(index: number) {
  const alert = this.tankAlerts[index];
  if (alert.enabled && !alert.message?.includes('% full')) {
    alert.message = `Tank is ${alert.level}% full`;
  }
}



exportToExcel(): void {
  if (!this.dailyReports || this.dailyReports.length === 0) {
    this.message.warning('No data to export');
    return;
  }

  // 1. Header info rows
  const headerInfo = [
    ['Site Name:', this.device.name || 'N/A'],
    ['IMEI:', this.device.uuid || 'N/A'],
    ['Area:', this.device.area || 'N/A'],
    [], // empty row before table
  ];

  // 2. Table data rows
  const tableHeaders = [
    'Date & Time',
    'Tank Level',
    'Switch 1',
    'Switch 2',
    'Switch 3',
    'Motor Status'
  ];

  const tableData = this.dailyReports.map(row => [
    new Date(row.date).toLocaleString(),
    row.level,
    row.do?.[0] === 1 ? 'ON' : 'OFF',
    row.do?.[1] === 1 ? 'ON' : 'OFF',
    row.do?.[2] === 1 ? 'ON' : 'OFF',
    row.pumpStatus === 1 ? 'ON' : 'OFF'
  ]);

  // 3. Combine all
  const fullSheetData = [...headerInfo, tableHeaders, ...tableData];

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(fullSheetData);
  const workbook: XLSX.WorkBook = {
    Sheets: { 'Daily Report': worksheet },
    SheetNames: ['Daily Report']
  };

  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const fileData: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(fileData, `Daily_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

private amodeTimeoutRef: any;

loadingAmode: boolean = false;


onToggleTimer(Mode: number): void {
  if (this.loadingAmode) return;

  this.loadingAmode = true;

  const payload = {
    type: 'config',
    id: 1,
    key: 'timer',
    value: String(Mode)
  };

  this.mqtt.publish(this.device.uuid, JSON.stringify(payload));

  this.amodeTimeoutRef = setTimeout(() => {
    this.loadingAmode = false;
    console.warn('Auto mode toggle timeout (30s)');
  }, 10000);
}
sendGetTime(): void {
    const payload = {
      type: 'command',
      id: 1,
      cmd: 'get_time'
    };
    this.mqtt.publish(this.device.uuid, JSON.stringify(payload));
  }

}