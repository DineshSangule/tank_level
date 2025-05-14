import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { AddTankComponent } from './pages/home/add-tank/add-tank.component';
import { ReportsComponent } from './pages/home/reports/reports.component';
import { LoginComponent } from './pages/login/login.component';
import { UsersComponent } from './pages/home/users/users.component';

export const routes: Routes = [
    {
        path:'',component:HomeComponent,
        children:[
            {
                path:'dashboard',component:DashboardComponent
            },
            {path:'addtank',component:AddTankComponent},
            {path:'reports',component:ReportsComponent},
            {path:'users',component:UsersComponent}
        ]
    },
    {path:'login',component:LoginComponent}
];
