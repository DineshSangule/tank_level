import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzCardModule } from 'ng-zorro-antd/card';
import { FormsModule } from '@angular/forms';
import 'echarts-liquidfill';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgxEchartsModule, CommonModule, NzCardModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isBrowser: boolean;
  devices: any[] = [];

  tankName = 'Tank 1'; 
  isEditing = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    setInterval(() => {
      this.checkTankLevels();
    }, 5000);

    const deviceData = [
      {
        name: 'Pump 1',
        redWireVoltage: 10,
        yellowWireVoltage: 0,
        blueWireVoltage: 20,
        redWireCurrent: 10,
        yellowWireCurrent: 0,
        blueWireCurrent: 10,
        tankName: 'Tank',
        voiceAnnounced: false
      }
    ];

    this.devices = deviceData.map(device => {
      const waterLevel = this.calculateWaterLevel(device);
      const options = this.generateChartOptions(device, waterLevel);
      return { ...device, chartOptions: options, level: waterLevel };
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
      yellowWireCurrent
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
          outline: { show: false },
          backgroundStyle: { color: '#ffff' },
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
                fontSize: 30,
                color: 'black',
                fontWeight: 'bold',
                lineHeight: 60
              }
            },
            align: 'center',
            verticalAlign: 'middle',
            position: ['50%', '50%']
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

  editTankName() {
    this.isEditing = true;
  }

  saveTankName() {
    this.isEditing = false;
    console.log('Updated tank name:', this.tankName);
  }

 speak(message: string): void {
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US'; 
  utterance.rate = 0.8;    
  utterance.pitch = 1;      
  utterance.volume = 1;     

  const voices = speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google'));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  speechSynthesis.cancel(); 
  speechSynthesis.speak(utterance);
}

  checkTankLevels(): void {
  const levelsToAnnounce = [20, 40, 60, 80, 100];

  this.devices.forEach(device => {
    const level = device.level;
    if (!device.voiceAnnouncedLevels) {
      device.voiceAnnouncedLevels = {};
    }

    levelsToAnnounce.forEach(threshold => {
      if (level === threshold && !device.voiceAnnouncedLevels[threshold]) {
        this.speak(`${device.tankName || 'Tank'} ${threshold} percent full`);
        device.voiceAnnouncedLevels[threshold] = true;
      }

      if (level < threshold - 5 || level > threshold + 5) {
        device.voiceAnnouncedLevels[threshold] = false;
      }
    });
  });
}

}
