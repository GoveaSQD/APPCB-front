import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'universidades',
    loadComponent: () => import('./features/universidades/universidades.component').then(m => m.UniversidadesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'modalidades',
    loadComponent: () => import('./features/modalidades/modalidades.component').then(m => m.ModalidadesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'becados',
    loadComponent: () => import('./features/becados/becados.component').then(m => m.BecadosComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
    canActivate: [AuthGuard, AdminGuard] // Solo admin
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];