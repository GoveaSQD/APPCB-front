import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Services
import { DashboardService, DashboardStats } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    ChartModule,
    ProgressBarModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    TooltipModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  dateToday = new Date();
  stats: DashboardStats = {
    totalBecados: 0,
    totalUniversidades: 0,
    totalModalidades: 0,
    totalUsuarios: 0,
    becadosActivos: 0,
    universidadesPorPais: [],
    ultimosBecados: [],
    loading: true
  };
  
  chartData: any;
  chartOptions: any;
  usuario: any;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.usuario = this.authService.getUser();
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.initChartOptions();
  }

  loadDashboardData(): void {
    this.stats.loading = true;
    
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = { ...data, loading: false };
        this.updateChartData();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Dashboard actualizado correctamente',
          life: 2000
        });
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las estadísticas',
          life: 5000
        });
        this.stats.loading = false;
      }
    });
  }

  initChartOptions(): void {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
            font: { size: 12 }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#495057' },
          grid: { color: '#e5e7eb' }
        },
        x: {
          ticks: { color: '#495057' },
          grid: { display: false }
        }
      },
      maintainAspectRatio: false
    };
  }

  updateChartData(): void {
    this.chartData = {
      labels: this.stats.universidadesPorPais.map(item => item.pais),
      datasets: [
        {
          label: 'Universidades por país',
          backgroundColor: ['#1f3d66', '#2a4a7a', '#355888', '#406696', '#4b74a4'],
          borderRadius: 8,
          data: this.stats.universidadesPorPais.map(item => item.cantidad)
        }
      ]
    };
  }

  getSeverity(activo: boolean): 'success' | 'danger' | 'info' {
    return activo ? 'success' : 'danger';
  }

  getBecadosActivosPorcentaje(): number {
    if (this.stats.totalBecados === 0) return 0;
    return Math.round((this.stats.becadosActivos / this.stats.totalBecados) * 100);
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }
}