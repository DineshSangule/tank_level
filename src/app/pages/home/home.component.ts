import { Component, OnInit, ElementRef, HostListener,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { RouterModule, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';

import { AuthService } from '../../services/auth.service';
import { MqttService } from '../../services/mqtt.service';

export interface tank {
  tankName: string;
  level: number;
  status: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NzTableModule,
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
  username: string = '';
  isMobile = false;

  @ViewChild('siderRef', { static: true }) siderRef!: ElementRef;


  constructor(
    private eRef: ElementRef,
    private auth: AuthService,
    private router: Router,
    private message: NzMessageService,
    private Mqtt: MqttService
  ) {}


@HostListener('document:click', ['$event'])
handleClickOutside(event: MouseEvent): void {
  const isMobile = window.innerWidth < 768;

  const clickedInsideSidebar = this.siderRef?.nativeElement.contains(event.target);
  const clickedToggle = this.eRef.nativeElement.querySelector('.trigger')?.contains(event.target);

  if (isMobile && !clickedInsideSidebar && !clickedToggle) {
    this.isCollapsed = true;
  }
}

  ngOnInit(): void {
    this.loadDevices();
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.username = payload.username || payload.name;
    }
  }

  loadDevices(): void {
    this.auth.getDevices().subscribe({
      next: (res: any) => {
       // console.log('API response:', res);
        if (res.success && Array.isArray(res.data)) {
          this.devices = res.data;
          this.Mqtt.connect(res.data);
        } else {
          this.message.warning('No devices found.');
        }
      },
      error: (err) => {
       // console.error('Error fetching devices:', err);
        this.message.error('Failed to load devices.');
      }
    });
  }

  toggleDeviceList(): void {
    this.showDeviceList = !this.showDeviceList;
  }

  toggleTanks(): void {
    this.showTanks = !this.showTanks;
  }

  goToDashboard(id: number): void {
    this.router.navigate(['/dashboard', id]);
  }

  logout(): void {
    alert('Are you sure you want to logout?');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  onBreakpoint(collapsed: boolean): void {
    this.isCollapsed = collapsed;
  }

  onLayoutClick(): void {
    const isMobile = window.innerWidth < 992;
    if (isMobile && !this.isCollapsed) {
      this.isCollapsed = true;
    }
  
  }
}
