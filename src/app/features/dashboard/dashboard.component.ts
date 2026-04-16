import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';

// Services
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { BecadoService } from '../../core/services/becado.service';
import { UniversidadService } from '../../core/services/universidad.service';
import { ModalidadService } from '../../core/services/modalidad.service';

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
    FormsModule,
    CardModule,
    ButtonModule,
    ToastModule,
    SkeletonModule,
    DropdownModule
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
  fechaActual: Date = new Date();
  
  // Filtro por año
  anioSeleccionado: number = new Date().getFullYear();
  aniosDisponibles: number[] = [];
  exportando: boolean = false;
  
  // Datos originales sin filtrar
  datosOriginales: any = null;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private becadoService: BecadoService,
    private universidadService: UniversidadService,
    private modalidadService: ModalidadService,
    private messageService: MessageService
  ) {
    this.usuario = this.authService.getUser();
    this.generarAniosDisponibles();
  }

  ngOnInit(): void {
    this.cargarDashboard();
  }

  generarAniosDisponibles(): void {
    // Por defecto, mostrar años desde 2020 hasta 2026
    const anioActual = new Date().getFullYear();
    this.aniosDisponibles = [];
    
    for (let i = anioActual - 5; i <= anioActual; i++) {
      this.aniosDisponibles.push(i);
    }
  }

  cargarDashboard(): void {
    this.stats.loading = true;
    
    // Cargar todos los datos sin filtrar primero
    Promise.all([
      this.becadoService.getAll().toPromise(),
      this.universidadService.getAll().toPromise(),
      this.modalidadService.getAll().toPromise()
    ]).then(([becadosResp, universidadesResp, modalidadesResp]) => {
      const todosBecados = becadosResp?.data || [];
      const universidades = universidadesResp?.data || [];
      const modalidades = modalidadesResp?.data || [];
      
      // Guardar datos originales para filtrar después
      this.datosOriginales = {
        becados: todosBecados,
        universidades: universidades,
        modalidades: modalidades
      };
      
      // Filtrar por año y calcular estadísticas
      this.calcularEstadisticasPorAnio(this.anioSeleccionado);
      this.stats.loading = false;
    }).catch(error => {
      console.error('Error cargando dashboard:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los datos',
        life: 5000
      });
      this.stats.loading = false;
    });
  }

calcularEstadisticasPorAnio(anio: number): void {
  if (!this.datosOriginales) return;
  
  // Filtrar becados que tienen al menos un pago en el año seleccionado
  const becadosFiltrados = this.datosOriginales.becados.filter((becado: any) => {
    // Si no tiene pagos, no se incluye en ningún año filtrado
    if (!becado.pagos || becado.pagos.length === 0) {
      return false;
    }
    
    // Verificar si algún pago es del año seleccionado
    return becado.pagos.some((pago: any) => {
      if (pago.fecha_pago) {
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getFullYear() === anio;
      }
      return false;
    });
  });
  
  // Si no hay becados para el año seleccionado
  if (becadosFiltrados.length === 0 && anio !== 2026) {
    this.stats = {
      ...this.stats,
      bolsaTotal: 0,
      erogadoTotal: 0,
      pendienteTotal: 0,
      perdidoInactivos: 0,
      totalBecados: 0,
      becadosActivos: 0,
      becadosInactivos: 0,
      loading: false
    };
    
    this.messageService.add({
      severity: 'info',
      summary: 'Sin datos',
      detail: `No hay becados con pagos en el año ${anio}`,
      life: 3000
    });
    return;
  }
  
  // Calcular estadísticas solo con los becados filtrados
  const becadosActivos = becadosFiltrados.filter((b: any) => b.estatus === 1).length;
  const becadosInactivos = becadosFiltrados.filter((b: any) => b.estatus === 0).length;
  
  const bolsaTotal = becadosFiltrados.reduce((sum: number, b: any) => sum + (Number(b.monto_autorizado) || 0), 0);
  
  // Calcular erogado total solo de pagos en el año seleccionado
  const erogadoTotal = becadosFiltrados.reduce((sum: number, b: any) => {
    const pagosAnio = (b.pagos || []).filter((pago: any) => {
      const fechaPago = new Date(pago.fecha_pago);
      return fechaPago.getFullYear() === anio;
    });
    const totalPagos = pagosAnio.reduce((s: number, p: any) => s + (Number(p.monto) || 0), 0);
    return sum + totalPagos;
  }, 0);
  
  const pendienteTotal = bolsaTotal - erogadoTotal;
  
  // Perdido: solo becados inactivos que tuvieron pagos en el año
  const perdidoInactivos = becadosFiltrados
    .filter((b: any) => b.estatus === 0)
    .reduce((sum: number, b: any) => {
      const pagosAnio = (b.pagos || []).filter((pago: any) => {
        const fechaPago = new Date(pago.fecha_pago);
        return fechaPago.getFullYear() === anio;
      });
      const erogadoEnAnio = pagosAnio.reduce((s: number, p: any) => s + (Number(p.monto) || 0), 0);
      const pendiente = (Number(b.monto_autorizado) || 0) - erogadoEnAnio;
      return sum + (pendiente > 0 ? pendiente : 0);
    }, 0);
  
  this.stats = {
    ...this.stats,
    bolsaTotal,
    erogadoTotal,
    pendienteTotal: pendienteTotal > 0 ? pendienteTotal : 0,
    perdidoInactivos: perdidoInactivos > 0 ? perdidoInactivos : 0,
    totalBecados: becadosFiltrados.length,
    totalUniversidades: this.datosOriginales.universidades.length,
    totalModalidades: this.datosOriginales.modalidades.length,
    becadosActivos,
    becadosInactivos,
    loading: false
  };
  
  console.log(`Estadísticas para ${anio}:`, {
    becados: becadosFiltrados.length,
    erogadoTotal,
    bolsaTotal
  });
}

  cambiarAnio(): void {
    this.stats.loading = true;
    
    // Pequeño delay para mostrar el loading
    setTimeout(() => {
      this.calcularEstadisticasPorAnio(this.anioSeleccionado);
      this.messageService.add({
        severity: 'info',
        summary: 'Filtro aplicado',
        detail: `Mostrando datos del año ${this.anioSeleccionado}`,
        life: 2000
      });
    }, 100);
  }

  async exportarReporte(): Promise<void> {
    this.exportando = true;
    
    try {
      // Crear contenido del reporte
      const fecha = new Date();
      const contenido = `
========================================
      REPORTE DE DASHBOARD
      Sistema de Becas
      Fecha: ${fecha.toLocaleString()}
      Año filtrado: ${this.anioSeleccionado}
========================================

RESUMEN FINANCIERO
----------------------------------------
Bolsa Total: ${this.formatCurrency(this.stats.bolsaTotal)}
Dinero Erogado: ${this.formatCurrency(this.stats.erogadoTotal)}
Faltante Total: ${this.formatCurrency(this.stats.pendienteTotal)}
Perdido (Inactivos): ${this.formatCurrency(this.stats.perdidoInactivos)}
Progreso de Erogado: ${this.getPorcentajeErogado().toFixed(2)}%

RESUMEN DE BECADOS
----------------------------------------
Total Becados: ${this.stats.totalBecados}
  - Activos: ${this.stats.becadosActivos}
  - Inactivos: ${this.stats.becadosInactivos}
Total Universidades: ${this.stats.totalUniversidades}
Total Modalidades: ${this.stats.totalModalidades}

========================================
      Fin del Reporte
========================================
      `;
      
      // Crear blob y descargar
      const blob = new Blob([contenido], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_dashboard_${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Reporte exportado correctamente',
        life: 3000
      });
    } catch (error) {
      console.error('Error al exportar:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo exportar el reporte',
        life: 5000
      });
    } finally {
      this.exportando = false;
    }
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