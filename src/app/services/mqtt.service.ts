import { Injectable } from '@angular/core';
import  { connect, MqttClient, IClientOptions } from 'mqtt';
import mqtt from 'mqtt';

import { MQTT_SERVICE_OPTIONS } from '../mqtt-config';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MqttService {
  private client: MqttClient;
  private messageSubject = new Subject<{ topic: string; message: string }>();

  constructor() {
    const { hostname, port, protocol, ...options } = MQTT_SERVICE_OPTIONS;
    const brokerUrl = `${protocol}://${hostname}:${port}`;
    this.client = mqtt.connect(brokerUrl, options); 

    this.client.on('connect', () => {
      console.log(' MQTT connected');
      this.subscribe('pump/data');
    });

    this.client.on('error', (err) => {
      console.error(' MQTT connection error:', err);
    });

    this.client.on('message', (topic, message) => {
      this.messageSubject.next({ topic, message: message.toString() });
    });
  }

  subscribe(topic: string): void {
    this.client.subscribe(topic, {}, (err) => {
      if (err) {
        console.error(` Subscribe error: ${err.message}`);
      } else {
        console.log(` Subscribed to: ${topic}`);
      }
    });
  }

  getMessages() {
    return this.messageSubject.asObservable();
  }
}
