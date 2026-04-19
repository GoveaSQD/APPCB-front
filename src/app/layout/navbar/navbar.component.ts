import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MenuItem } from 'primeng/api';

import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';

import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

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
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  userMenu: MenuItem[] = [];
  usuario: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUser();
    this.buildMenu();
  }

  buildMenu(): void {
    const menuItems: MenuItem[] = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/dashboard']
      }
    ];

    const rolString = this.authService.getRolString();

    if (rolString === 'admin' || rolString === 'registro') {
      menuItems.push(
        { label: 'Universidades', icon: 'pi pi-building', routerLink: ['/universidades'] },
        { label: 'Modalidades', icon: 'pi pi-tags', routerLink: ['/modalidades'] }
      );
    }
    
    menuItems.push({
      label: 'Becados',
      icon: 'pi pi-users',
      routerLink: ['/becados']
    });

    if (rolString === 'admin') {
      menuItems.push({
        label: 'Usuarios',
        icon: 'pi pi-user',
        routerLink: ['/usuarios']
      });
    }

    this.items = menuItems;

    this.userMenu = [
      {
        label: 'Mi Perfil',
        icon: 'pi pi-user',
        command: () => this.router.navigate(['/perfil'])
      },
      {
        label: `Rol: ${this.getRolLabel()}`,
        icon: 'pi pi-tag',
        disabled: true
      },
      { separator: true },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  getRolLabel(): string {
    if (!this.usuario?.tipo_usuario) return 'Sin rol';
    const roles: Record<number, string> = {
      1: 'Administrador',
      2: 'Registro',
      3: 'Pagos'
    };
    return roles[this.usuario.tipo_usuario];
  }

  getRolClass(): string {
    if (!this.usuario?.tipo_usuario) return 'bg-gray-100 text-gray-700';
    const classes: Record<number, string> = {
      1: 'bg-red-100 text-red-700',
      2: 'bg-blue-100 text-blue-700',
      3: 'bg-yellow-100 text-yellow-700'
    };
    return classes[this.usuario.tipo_usuario];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}