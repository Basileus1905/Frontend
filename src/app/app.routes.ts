// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login-component/login-component.component';
import { AuthGuard } from './auth-guard';
import {HomeComponent} from './home-component/home-component.component';
import { CalendarComponent } from './calendar/calendar.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent},
  { path: 'calendar', component: CalendarComponent},
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];
