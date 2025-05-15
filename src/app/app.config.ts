import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { en_US, NZ_I18N, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideEchartsCore } from 'ngx-echarts';
import { MQTT_SERVICE_OPTIONS } from './mqtt-config';  


import { NzIconModule, NZ_ICONS } from 'ng-zorro-antd/icon';
import {
  DashboardOutline,
  PlusOutline,
  MenuFoldOutline,
  
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);


const icons = [DashboardOutline, PlusOutline, MenuFoldOutline];

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(BrowserAnimationsModule),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(),

    provideEchartsCore({ echarts: () => import('echarts') }),
    { provide: NZ_ICONS, useValue: icons },
    { provide: 'MQTT_SERVICE_OPTIONS', useValue: MQTT_SERVICE_OPTIONS },

  ]
};
