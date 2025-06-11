import { Injectable } from '@angular/core';
import { connect, MqttClient, IClientOptions } from 'mqtt';
import mqtt from 'mqtt';

import { MQTT_SERVICE_OPTIONS } from '../mqtt-config';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: any;
  private messageSubject = new Subject<{ topic: string; message: string }>();

  public data: any = {};

  constructor() {
  }

  connect(devices: any) {
    devices.forEach((device: any) => {
      this.data[device.uuid] = {}
    });
    this.client = mqtt.connect("ws://mqtt.agromationindia.com/mqtt", {
      port: 80,
      username: "vijay",
      password: "pratap"
    });
    this.client.on('connect', () => {
      console.log(' MQTT connected');
      // this.subscribe('pump/data');
      devices.forEach((device: any) => {
        this.subscribe("vidani/vl/" + device.uuid + "/data")
      });
    });

    this.client.on('error', (err: any) => {
      console.error(' MQTT connection error:', err);
    });

    this.client.on('message', (topic: string, message: any) => {
      // this.messageSubject.next({ topic, message: message.toString() });
      const imei = topic.split('/')[2];
      const data = JSON.parse(message.toString());
      const ai = data['devices'][0]['ai'];
      let level = 0;
      if (ai[4])
        level = 100;
      else if (ai[3])
        level = 80;
      else if (ai[2])
        level = 60;
      else if (ai[1])
        level = 40;
      else if (ai[0])
        level = 20;
      else
        level = 0;
      const pumpStatus = ai[5] ? 1 : 0;
      const date = new Date();
      this.data[imei] = { ai, level, pumpStatus, date };
      console.log(this.data);
    });
  }

  subscribe(topic: string): void {
    this.client.subscribe(topic, {}, (err: any) => {
      if (err) {
        console.error(` Subscribe error: ${err.message}`);
      } else {
        console.log(` Subscribed to: ${topic}`);
      }
    });
  }

   sendRelayCommand(uuid: string, index: number, value: 0 | 1): void {
    // Get current ai array or initialize to zeros (assuming length 19)
    const currentAi: number[] = this.data[uuid]?.ai || new Array(19).fill(0);

    // Clone to avoid mutation
    const newAi = [...currentAi];

    // Set user-controlled index value
    newAi[index] = value;

    const topic = `vidani/vl/${uuid}/command`;
    const payload = { ai: newAi };
    const message = JSON.stringify(payload);

    this.client.publish(topic, message, {}, (err: any) => {
      if (err) {
        console.error(`Publish error: ${err.message}`);
      } else {
        console.log(`Sent relay command to ${topic}:`, message);
      }
    });
  }
}