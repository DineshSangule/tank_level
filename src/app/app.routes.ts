import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/home/dashboard/dashboard.component';
import { AddTankComponent } from './pages/home/add-tank/add-tank.component';
import { LoginComponent } from './pages/login/login.component';
import { UsersComponent } from './pages/home/users/users.component';
import { ReportsComponent } from './pages/home/reports/reports.component';
import { AuthGuard } from './guards/auth.guard';
import { Component } from '@angular/core';
import { SchedulingComponent } from './pages/home/scheduling/scheduling.component';
import { MainDashboardComponent } from './pages/home/main-dashboard/main-dashboard.component';

export const routes: Routes = [
        {path:'login',component:LoginComponent},

    {
        path:'',component:HomeComponent,canActivate:[AuthGuard],
        children:[
            {path: '',redirectTo: 'maindashboard', pathMatch:'full'},
            {path:'dashboard/:id',component:DashboardComponent,
                  data: { renderMode: 'prerender' }
             },
            {path:'addtank',component:AddTankComponent},
            {path:'users',component:UsersComponent},
            {path:'reports',component:ReportsComponent},
            {path: 'scheduling',component:SchedulingComponent},
            {path: 'maindashboard',component:MainDashboardComponent},
            {path: '**',redirectTo:'maindashboard'}
        ]
    },
];
