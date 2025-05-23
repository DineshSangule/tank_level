import { Component, OnInit } from '@angular/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { NzSelectModule } from 'ng-zorro-antd/select';

import { format } from 'date-fns';  

 export interface HourlyReport {
   time: string;   
  value: number;
  }
 export interface MonthlyReport {
   date: string;  
  value: number;
 }


@Component({
  selector: 'app-reports',
  imports: [NzFormModule,NzCardModule,NzInputModule , NzCheckboxModule,NzButtonModule ,CommonModule ,NzCollapseModule, FormsModule, NzDatePickerModule,NzTableModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent  {
dailyDeviceId = 1;
dailyFromDate = '';
dailyToDate= '';
dailyReports: any[] = [];

monthlyDeviceId = 1;
monthlyFromDate = '';
monthlyToDate = '';
monthlyReports: any[] = [];

  constructor(
    private reportService: AuthService,
    private message: NzMessageService
  ) {}

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

 exportToExcel(type: 'daily' | 'monthly'): void {
  let dataToExport: any[] = [];

  if (type === 'daily') {
    if (!this.dailyReports || this.dailyReports.length === 0) {
      this.message.warning(`No daily reports to export`);
      return;
    }
    dataToExport = this.dailyReports.map((item: any) => ({
      time: item.date,
      level: item.level
    }));
  } else {
    if (!this.monthlyReports || this.monthlyReports.length === 0) {
      this.message.warning(`No monthly reports to export`);
      return;
    }
    dataToExport = this.monthlyReports; 
  }

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook: XLSX.WorkBook = { Sheets: { [`${type}-reports`]: worksheet }, SheetNames: [`${type}-reports`] };
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const dataBlob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  FileSaver.saveAs(dataBlob, `${type}-report.xlsx`);
}
}