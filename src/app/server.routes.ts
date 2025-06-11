import { Route } from '@angular/router';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { getPrerenderParams } from './prerender-params/dashboard.params';

export const serverRoutes: Route[] = [
  {
    path: 'dashboard/:id',
    component: DashboardComponent,
    data: {
      renderMode: 'pre-render',
      getPrerenderParams
    }
  }
];
