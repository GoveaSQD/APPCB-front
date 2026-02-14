import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // Rutas de autenticación (SIN LAYOUT)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Rutas protegidas (CON LAYOUT)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'universidades', loadComponent: () => import('./features/universidades/universidades.component').then(m => m.UniversidadesComponent) },
      { path: 'modalidades', loadComponent: () => import('./features/modalidades/modalidades.component').then(m => m.ModalidadesComponent) },
      { path: 'becados', loadComponent: () => import('./features/becados/becados.component').then(m => m.BecadosComponent) },
      { path: 'usuarios', loadComponent: () => import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
    ]
  },

  // Redirección por defecto
  { path: '**', redirectTo: '/auth/login' }
];