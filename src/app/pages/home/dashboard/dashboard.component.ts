import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzCardModule } from 'ng-zorro-antd/card';
import 'echarts-liquidfill';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgxEchartsModule, CommonModule, NzCardModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isBrowser: boolean;
  devices: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const deviceData = [
      {
        name: 'Pump ',
        redWireVoltage: 10,
        yellowWireVoltage: 10,
        blueWireVoltage: 0,
        redWireCurrent: 10,
        yellowWireCurrent: 0,
        blueWireCurrent :0,
      },
  
    ];

    this.devices = deviceData.map(device => {
      const waterLevel = this.calculateWaterLevel(device);
      const options = this.generateChartOptions(device, waterLevel);
      return { ...device, chartOptions: options, waterLevel };
    });
  }
    isPumpOn(device: any): boolean {
    return device.blueWireCurrent > 0;
  }

  calculateWaterLevel(device: any): number {
    const {
      redWireVoltage,
      yellowWireVoltage,
      blueWireVoltage,
      redWireCurrent,
      yellowWireCurrent,
    } = device;

    if (yellowWireCurrent > 0) return 100;
    if (redWireCurrent > 0) return 80;
    if (blueWireVoltage > 0) return 60;
    if (yellowWireVoltage > 0) return 40;
    if (redWireVoltage > 0) return 20;
    return 0;
  }

  generateChartOptions(device: any, waterLevel: number): any {
    return {
      title: {
        left: 'center',
        text: 'Tank Water Level',
        top: 'top'
      },
      series: [
        {
          type: 'liquidFill',
          shape: 'rect',
          data: [waterLevel / 100],
          radius: '100%',
          center: ['50%', '60%'],
          amplitude: 0,
          waveAnimation: false,
          outline: {
            show: false
          },
          backgroundStyle: {
            color: '#ffff'
          },
          itemStyle: {
            color: {
              image: this.createDottedPattern(),
              repeat: 'repeat'
            },
            opacity: 0.8
          },
          label: {
            formatter: `{percentage|${waterLevel}%}`,
            rich: {
              percentage: {
                fontSize: 18,
                color: 'black',
                fontWeight: 'bold',
                lineHeight: 20
              }
            },
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', '60%']
          }
        }
      ],
      graphic: {
        elements: this.createDotsInsideTank(
          waterLevel,
          device.redWireCurrent,
          device.yellowWireCurrent,
          device.blueWireVoltage,
          device.yellowWireVoltage,
          device.redWireVoltage
        )
      }
    };
  }

  createDotsInsideTank(
    waterLevel: number,
    redWireCurrent: number,
    yellowWireCurrent: number,
    blueWireVoltage: number,
    yellowWireVoltage: number,
    redWireVoltage: number
  ): any[] {
    const thresholds = [100, 80, 60, 40, 20];
    const signals = [yellowWireCurrent, redWireCurrent, blueWireVoltage, yellowWireVoltage, redWireVoltage];

    return thresholds.map((level, index) => {
      const top = 110 - level;
      const left = 82;
      let color = '#ccc';
      if (waterLevel >= level) {
        color = signals[index] > 0 ? 'green' : 'red';
      }
      return [
        {
          type: 'circle',
          shape: { cx: 0, cy: 0, r: 5 },
          left: `${left}%`,
          top: `${top}%`,
          style: { fill: color },
          z: 100
        },
        {
          type: 'text',
          left: `${left + 6}%`,
          top: `${top}%`,
          style: {
            text: `${level}%`,
            fill: '#000',
            font: '12px sans-serif',
            textVerticalAlign: 'middle'
          },
          z: 100
        }
      ];
    }).flat();
  }

  createDottedPattern(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#4A90E2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(10, 5);
    ctx.stroke();
    return canvas;
  }
}
