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


import { AuthService } from '../../services/auth.service';

export interface tank {
  tankName: string;
  level: number;
  status: string;
}

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [
    NzTableModule ,
    CommonModule,
    NzCardModule,
    NzMenuModule,
    NzLayoutModule,
    NzIconModule,
    NzBreadCrumbModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] 
})
export class HomeComponent implements OnInit {
  isCollapsed = false;
  showTanks = false; 
  devices: any[] = [];
  token: string = '';
  showDeviceList = false;
error = '';

  constructor(private eRef: ElementRef, private auth: AuthService,private router: Router,    private message: NzMessageService
) {}

  toggleDeviceList(): void {
  this.showDeviceList = !this.showDeviceList;
}


  onBreakpoint(collapsed: boolean): void {
    this.isCollapsed = collapsed;
  }

 logout(): void{
  localStorage.removeItem('token');
  this.router.navigate(['/login']);
 }

ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.auth.getDevices().subscribe({
      next: (res: any) => {
        console.log('API response:', res);
        if (res.success && Array.isArray(res.data)) {
          this.devices = res.data;
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

    toggleTanks() {
    this.showTanks = !this.showTanks;
  }
}
