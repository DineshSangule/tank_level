import { Component } from '@angular/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-reports',
  imports: [CommonModule ,NzCollapseModule, FormsModule, NzDatePickerModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  Date: Date| null= new Date();


}
