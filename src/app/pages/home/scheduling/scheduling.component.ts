import { Component, OnInit } from '@angular/core';
import { NgxEchartsModule } from 'ngx-echarts';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scheduling',
  imports: [NgxEchartsModule,NzCardModule, FormsModule,CommonModule,
    NzCardModule,
    NzSwitchModule,
    NzTimePickerModule,
    NzButtonModule],
  templateUrl: './scheduling.component.html',
  styleUrl: './scheduling.component.css'
})
export class SchedulingComponent {
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
}