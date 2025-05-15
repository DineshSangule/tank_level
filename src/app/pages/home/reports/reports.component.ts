import { Component } from '@angular/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { FormsModule } from '@angular/forms';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../../services/report.service';
import  dayjs from 'dayjs';

@Component({
  selector: 'app-reports',
  imports: [CommonModule ,NzCollapseModule, FormsModule, NzDatePickerModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent {
  selectedDate: Date| null= new Date();
  reportData: any[]=[];

  constructor(private reportService: ReportService){}

  ngOnInit(): void{
    this.fetchReport();
  }

  onDateChange(): void{
    this.fetchReport();
  }

  fetchReport(): void
  {
    const formattedDate = dayjs(this.selectedDate).format('yyyy-mm-dd');
    this.reportService.getReportByDate(formattedDate).subscribe
    (
      {
        next: (data)=>
        {
          this.reportData = data;
        },
        error: (err)=>
        {
          console.error('Error Fetching report',err);
        }
      }
    );
  }


}
