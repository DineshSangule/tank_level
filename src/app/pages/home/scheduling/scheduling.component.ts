import {
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'; 

// Services
import { MqttService } from '../../../services/mqtt.service';
import { AuthService } from '../../../services/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';

// NG-ZORRO Modules
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.css'],
  imports: [
    NzSpinModule,
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzSelectModule,
    NzInputModule,
    NzToolTipModule,
    NzCollapseModule,
    NzDatePickerModule,
    NzTableModule,
    NzAlertModule,
    NzTabsModule,
    NzStatisticModule,
    NzTimePickerModule,
    NzCardModule,
    NzFormModule,
    NzLayoutModule,
    NzIconModule,
    NzSwitchModule,
    NzSpinModule,
    NzPopconfirmModule 
  ]
})
export class SchedulingComponent implements OnInit {
  isDesktop = true;

  device: any = {};
  device_id: number = 0;
  data: any;
  startTimes: Date[] = [];
  endTimes: Date[] = [];
  mcconfig: any;
  private isBrowser: boolean;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public mqtt: MqttService,
    private auth: AuthService,
    private message: NzMessageService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    this.route.params.subscribe((param) => {
      this.device_id = +param['id'];
      this.device = this.mqtt.devices[this.device_id];

      if (!this.device || !this.device.uuid) {
        this.router.navigate(['/maindashboard']);
      }
    });
  }

  ngOnInit(): void {
      this.checkScreenSize();
  window.addEventListener('resize', this.checkScreenSize.bind(this));
    const checkDataInterval = setInterval(() => {
    if (this.mqtt.data?.[this.device.uuid]?.config?.value?.length) {
      this.loading = false;
      clearInterval(checkDataInterval);
    }
  }, 300);
  }

  
checkScreenSize(): void {
  this.isDesktop = window.innerWidth > 768;
}

  ngDoCheck(): void {
    const uuid = this.device?.uuid;
    const slots = this.mqtt?.data?.[uuid]?.config?.value || [];

    slots.forEach((slot: string, i: number) => {
      const parts = slot.split(',');
      if (parts.length >= 3) {
        const s = this.minutesToDate(+parts[1]);
        const e = this.minutesToDate(+parts[2]);
        if (!this.startTimes[i]) this.startTimes[i] = s;
        if (!this.endTimes[i]) this.endTimes[i] = e;
        this.loading = false;
      }
    });
  }

  

  minutesToDate(minutes: number): Date {
    const date = new Date();
    date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    return date;
  }

  dateToMinutes(date: Date): number {
    return date.getHours() * 60 + date.getMinutes();
  }

  updateSlotFromInputs(index: number, originalSlot: string): void {
    const parts = originalSlot.split(',');
    const enable = parts[0] ?? '0';
    const startMin = this.dateToMinutes(this.startTimes[index]);
    const endMin = this.dateToMinutes(this.endTimes[index]);

    const updatedSlot = `${enable},${startMin.toString().padStart(4, '0')},${endMin.toString().padStart(4, '0')}`;

    const uuid = this.device?.uuid;
    if (uuid && this.mqtt?.data?.[uuid]?.config?.value) {
      this.mqtt.data[uuid].config.value[index] = updatedSlot;
      this.sendSingleSlot(index);
      this.message.success(`✅ Slot ${index + 1} updated`);
    }
  }

sendSingleSlot(index: number): void {
  const imei = this.device?.uuid;
  if (!imei) {
    this.message.error('Pump IMEI not available');
    return;
  }

  const start = this.dateToMinutes(this.startTimes[index]).toString().padStart(4, '0');
  const end = this.dateToMinutes(this.endTimes[index]).toString().padStart(4, '0');
  const enable = '0'; 
  const slotNo = index.toString().padStart(2, '0');

  const slot = `${slotNo},${enable},${start},${end}`;

  const payload = {
    type: 'config',
    id: 1,
    key: 'stime',
    value: slot
  };

  this.mqtt.publish( imei, JSON.stringify(payload));

    const get = {
      type: 'command',
      id: 1,
      cmd: 'get_time'
    };
    this.mqtt.publish(this.device.uuid, JSON.stringify(get));

  

  
    this.reloadScheduling();
}

showScheduling = true;

reloadScheduling(): void {
  this.showScheduling = false;

  setTimeout(() => {
    this.showScheduling = true;
  }, 300);
}

  sendGetTime(): void {
    const uuid = this.device?.uuid;
    const payload = {
      type: 'command',
      id: 1,
      cmd: 'get_time' 
    };
    this.mqtt.publish(uuid, JSON.stringify(payload));
  }
}
