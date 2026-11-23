import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';

import { LayoutComponent } from './pages/layout/layout.component';
import { AuthGuard } from './service/auth.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'IBAESG', component: LayoutComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgetPasswordComponent },

  {
  path: '',
  component: LayoutComponent,
  
  children: [
    //  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, 
    //   { path: 'dashboard', component: DashboardComponent },
    {
      path: '',
      loadChildren: () =>
        import('./master/master/master.module').then(m => m.MasterModule)
    }
  ],
  canActivate: [AuthGuard]
},

{ path: '**', redirectTo: 'login' }


];
