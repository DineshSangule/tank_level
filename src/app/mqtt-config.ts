import { IClientOptions } from 'mqtt';

export const MQTT_SERVICE_OPTIONS: IClientOptions = {
  hostname: 'mqtt.agromationindia.com',
  port: 20011,
  protocol: 'ws',
  clientId: 'angular-mqtt-client-' + Math.random().toString(16).substr(2, 8),
  connectTimeout: 4000,
  keepalive: 60,
  clean: true
};
