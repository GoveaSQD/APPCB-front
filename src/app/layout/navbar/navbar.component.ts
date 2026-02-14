import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

// PrimeNG
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';

// Services
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    BadgeModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  items: MenuItem[];
  userMenu: MenuItem[];
  usuario: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.getUser();

    // Menú principal
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/dashboard']
      },
      {
        label: 'Universidades',
        icon: 'pi pi-building',
        routerLink: ['/universidades']
      },
      {
        label: 'Modalidades',
        icon: 'pi pi-tags',
        routerLink: ['/modalidades']
      },
      {
        label: 'Becados',
        icon: 'pi pi-users',
        routerLink: ['/becados']
      },
      {
        label: 'Usuarios',
        icon: 'pi pi-user',
        routerLink: ['/usuarios'],
        visible: this.authService.isAdmin()
      }
    ];

    // Menú de usuario (dropdown)
    this.userMenu = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/perfil'])
      },
      {
        label: 'Configuración',
        icon: 'pi pi-cog',
        command: () => this.router.navigate(['/configuracion'])
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}