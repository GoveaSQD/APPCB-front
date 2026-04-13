import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

// Services
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

export interface DashboardStats {
  bolsaTotal: number;
  erogadoTotal: number;
  pendienteTotal: number;
  perdidoInactivos: number;
  totalBecados: number;
  totalUniversidades: number;
  totalModalidades: number;
  becadosActivos: number;
  becadosInactivos: number;
  loading: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    ToastModule,
    SkeletonModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    bolsaTotal: 0,
    erogadoTotal: 0,
    pendienteTotal: 0,
    perdidoInactivos: 0,
    totalBecados: 0,
    totalUniversidades: 0,
    totalModalidades: 0,
    becadosActivos: 0,
    becadosInactivos: 0,
    loading: true
  };

  usuario: any;
  fechaActual: Date = new Date(); // ← AGREGADA

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.usuario = this.authService.getUser();
  }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.stats.loading = true;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = { ...data, loading: false };
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos',
          life: 5000
        });
        this.stats.loading = false;
      }
    });
  }

  refrescar(): void {
    this.cargarDashboard();
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Datos actualizados correctamente',
      life: 2000
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }

  getPorcentajeErogado(): number {
    if (this.stats.bolsaTotal === 0) return 0;
    return (this.stats.erogadoTotal / this.stats.bolsaTotal) * 100;
  }
}