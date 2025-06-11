import { Component, Inject, OnInit, PLATFORM_ID,Input } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Router } from '@angular/router';
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


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzInputModule ,NzCollapseModule,FormsModule,NzDatePickerModule ,NzTableModule,CommonModule ,NzTabsModule,NzStatisticModule ,NzTimePickerModule, CommonModule, NzCardModule,NzFormModule ,NzLayoutModule,NzIconModule ,NzSwitchModule ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  aiValues: number[] = []
  selectedUUID: string | null = null;
  level: number = 0;
  pumpStatus: number = 0;

  constructor(private router: Router, public mqtt: MqttService, private reportService: AuthService,
    private message: NzMessageService) {}

  ngOnInit(): void {
  
    setInterval(() => {
      this.updateDeviceData();
    }, 1000);
  }

  updateDeviceData(): void {
    if (!this.selectedUUID) {
      const keys = Object.keys(this.mqtt.data);
      if (keys.length > 0) {
        this.selectedUUID = keys[0];
      }
    }

    if (this.selectedUUID && this.mqtt.data[this.selectedUUID]) {
      const deviceData = this.mqtt.data[this.selectedUUID];
      this.level = deviceData.level;
      this.pumpStatus = deviceData.pumpStatus;

      if(Array.isArray(deviceData.ai))
      {
        this.aiValues = deviceData.ai;
      }
      
      console.log('Level:', this.level, 'Pump Status:', this.pumpStatus);
    }
  }

  isPumpOn(): boolean {
    return this.pumpStatus === 1;
  }

  getMarkers() {
    return[
   {
      bottom: '20%',
      color: (this.level >= 20)
        ? (this.aiValues[0] > 0 ? 'green' : 'red')
        : '#ccc'
    },
      {
      bottom: '40%',
      color: (this.level >= 40)
        ? (this.aiValues[1] > 0 ? 'green' : 'red')
        : '#ccc'
    },

      {
      bottom: '60%',
      color: (this.level >= 60)
        ? (this.aiValues[2] > 0 ? 'green' : 'red')
        : '#ccc'
    },
      {
      bottom: '80%',
      color: (this.level >= 80)
        ? (this.aiValues[3] > 0 ? 'green' : 'red')
        : '#ccc'
    },
      {
      bottom: '98%',
      color: (this.level >= 98)
        ? (this.aiValues[4] > 0 ? 'green' : 'red')
        : '#ccc'
    },
  ]
}

isTankEmpty(): boolean{
  return this.aiValues.slice(0,4).every(value => value ===0);
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
dailyToDate= '';
dailyReports: any[] = [];

monthlyDeviceId = 1;
monthlyFromDate = '';
monthlyToDate = '';
monthlyReports: any[] = [];



fetchDailyReports(): void {
  if (!this.dailyDeviceId || !this.dailyFromDate|| !this.dailyToDate) {
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

turnOnRelay(uuid: string) {
  this.mqtt.sendRelayCommand(uuid,6, 1);
}

turnOffRelay(uuid: string) {
  this.mqtt.sendRelayCommand(uuid,6, 0);
}


// tabs logic

turnOnClick() :void {
    alert('Do you want to turn the motor ON?');
  }

//config section

   panel=[
    {name:'Edit Device',active:false,arrow:true}
  ];

}

