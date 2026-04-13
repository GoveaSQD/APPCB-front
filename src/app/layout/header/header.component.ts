import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { DropdownModule } from 'primeng/dropdown';
import { BadgeModule } from 'primeng/badge';

// Services
import { AuthService } from '../../core/services/auth.service';
import { AnioService } from '../../core/services/anio.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
    DropdownModule,
    BadgeModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  usuario: any;
  anioSeleccionado: number;
  aniosDisponibles: { label: string; value: number }[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private anioService: AnioService
  ) {
    this.usuario = this.authService.getUser();
    this.anioSeleccionado = this.anioService.getAnioActual();
  }

  ngOnInit(): void {
    this.cargarAniosDisponibles();
  }

  cargarAniosDisponibles(): void {
    const anios = this.anioService.getAniosDisponibles();
    this.aniosDisponibles = anios.map(anio => ({
      label: anio.toString(),
      value: anio
    }));
  }

  cambiarAnio(): void {
    this.anioService.setAnio(this.anioSeleccionado);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}