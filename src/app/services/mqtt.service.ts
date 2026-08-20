import { Injectable } from '@angular/core';
import mqtt from 'mqtt';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: any;
  private messageSubject = new Subject<{ topic: string; message: string }>();

  public devices: any = {};
  public data: Record<string, any> = {};
  private deviceTopicTypes: Record<string, string> = {}; // Tracks 'sl' or 'vl' topic type per device UUID

  constructor() { }


  private protocol = typeof document !== 'undefined' && document.location.protocol === 'https:' ? 'wss' : 'ws';
  private url =
    typeof document !== 'undefined' && (document.location.hostname === 'localhost' || document.location.hostname === '127.0.0.1')
      ? 'ws://tank.shreeiot.com/mqtt'
      : `${this.protocol}://${typeof document !== 'undefined' ? document.location.hostname : 'tank.shreeiot.com'}/mqtt`;


  connect(devices: any[]): void {
    devices.forEach(device => {
      this.devices[device.id] = device;
      this.data[device.uuid] = {};
    });



    this.client = mqtt.connect(this.url, {

    });

    this.client.on('connect', () => {
      console.log(' MQTT connected');

      devices.forEach(device => {
        this.subscribe(`vidani/vl/${device.uuid}/data`);
        this.subscribe(`vidani/vl/${device.uuid}/config`);
        this.subscribe(`vidani/sl/${device.uuid}/data`);
        this.subscribe(`vidani/sl/${device.uuid}/config`);
      });
    });

    this.client.on('error', (err: any) => {
      console.error(' MQTT connection error:', err);
    });

    this.client.on('message', (topic: string, message: any) => {
      const parts = topic.split('/');
      const topicType = parts[1]; // 'vl' or 'sl'
      const imei = parts[2];
      const dataType = parts[3];

      if (topicType === 'vl' || topicType === 'sl') {
        this.deviceTopicTypes[imei] = topicType;
      }

      let payload: any;
      try {
        payload = JSON.parse(message.toString());
      } catch (e) {
        // console.error('❌ Invalid JSON:', message.toString());
        return;
      }

      //console.log(`📥 MQTT [${topic}] Payload:`, payload);

      if (!this.data[imei]) this.data[imei] = {};

      if (dataType === 'data') {
        const ai = payload?.devices?.[0]?.ai || [];
        let level = 0;

        if (ai[4] >= 4) level = 100;
        else if (ai[3] >= 4) level = 80;
        else if (ai[2] >= 5) level = 60;
        else if (ai[1] >= 5) level = 40;
        else if (ai[0] >= 5) level = 20;
        else level = 0;

        const data = {
          ...payload,
          date: new Date(),
          pumpStatus: ai[5] >= 4 ? 1 : 0,
          level: level,
          ai: ai,
          do: payload.devices?.[0]?.do
        };

        this.data[imei] = { ...this.data[imei], ...data };
        // console.log('Updated device data:', this.data[imei]);
      }

      else if (dataType === 'config') {
        const configData = payload.config || payload;
        const analogLimit = payload.analog_limit || [];

        this.data[imei] = {
          ...this.data[imei],
          config: configData,
          analog_limit: analogLimit
        };

        //  console.log('⚙️ Config data saved:', configData);

        if (configData?.type === 'time' && configData?.key === 'stime') {
          //  console.log('🕒 Schedule Config Received:');
          if (Array.isArray(configData.value)) {
            configData.value.forEach((slot: string, index: number) => {
              const [idStr, enableStr, startStr, endStr] = slot.split(',');
              const from = this.convertMinutesToTime(+startStr);
              const to = this.convertMinutesToTime(+endStr);
              const enabled = enableStr === '1' ? '✅' : '❌';
              // console.log(`  Slot ${index + 1}: ${enabled} ${from} → ${to}`);
            });
          }
        }
      }
    });
  }

  subscribe(topic: string): void {
    this.client.subscribe(topic, {}, (err: any) => {
      if (err) {
        //   console.error(`❌ Subscribe error: ${err.message}`);
      } else {
        //    console.log(`📡 Subscribed to: ${topic}`);
      }
    });
  }

  message(): Observable<{ topic: string; message: string }> {
    return this.messageSubject.asObservable();
  }

  publish(device_id: string | null, data: string): void {
    //const topic = `vidani/vl/${device_id}`;
    if (!device_id) return;
    let topic = '';
    if (device_id.startsWith('vidani/')) {
      const parts = device_id.split('/');
      const type = parts[1];
      const imei = parts[2];
      const activeType = this.deviceTopicTypes[imei] || type || 'vl';
      topic = `vidani/${activeType}/${imei}`;
    } else {
      const type = this.deviceTopicTypes[device_id] || 'vl';
      topic = `vidani/${type}/${device_id}`;
    }
    this.client.publish(topic, data, (err: any) => {
      if (err) {
        //    console.error('❌ Publish error:', err);
      } else {
        //     console.log(`📤 Published to: ${topic}`, data);
      }
    });
  }

  // Optional helper to convert minutes to HH:mm format
  private convertMinutesToTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${this.pad(hrs)}:${this.pad(mins)}`;
  }

  private pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }
}
