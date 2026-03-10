import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
import { ToastModule } from 'primeng/toast';
import { TabViewModule } from 'primeng/tabview';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';

// Services
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { 
  DashboardStats, 
  BecadoResumen, 
  TablaActivos, 
  TablaInactivos, 
  UniversidadResumen 
} from '../../core/models/dashboard.model';

// Para exportar a CSV
import * as FileSaver from 'file-saver';

// Para exportar a PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    ToastModule,
    TabViewModule,
    DropdownModule,
    InputTextModule,
    AccordionModule,
    DividerModule,
    PanelModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Estadísticas principales
  stats: DashboardStats = {
    totalBecados: 0,
    totalUniversidades: 0,
    totalModalidades: 0,
    totalUsuarios: 0,
    becadosActivos: 0,
    becadosInactivos: 0,
    bolsaTotal: 0,
    dineroErogado: 0,
    dineroFaltante: 0,
    dineroFaltanteActivos: 0,
    dineroFaltanteInactivos: 0,
    ultimosBecados: [],
    universidadesMorelia: [],
    distribucionEstatus: { activos: 0, inactivos: 0 },
    montosPorMes: { labels: [], datasets: [] },
    loading: true
  };

  // Tablas separadas
  tablaActivos: TablaActivos = {
    total: 0,
    montoPorErogarse: 0,
    becados: []
  };
  
  tablaInactivos: TablaInactivos[] = [];

  // Filtros
  filtroBusqueda: string = '';
  filtroTipoInactivo: string = 'todos';
  tiposInactivo = [
    { label: 'Todos', value: 'todos' },
    { label: 'Renuncia parcial', value: 'Renuncia parcial' },
    { label: 'Renuncia tácita', value: 'Renuncia tácita' },
    { label: 'Baja por terminación', value: 'Baja por terminación' },
    { label: 'Baja por reporte de universidad', value: 'Baja por reporte de universidad' }
  ];

  // Datos para gráficas
  chartDistribucion: any;
  chartMontos: any;
  chartOptions: any;

  // Fecha actual
  fechaActual = new Date();
  usuario: any;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.usuario = this.authService.getUser();
  }

  ngOnInit(): void {
    this.cargarTodosLosDatos();
    this.initChartOptions();
  }

  cargarTodosLosDatos(): void {
    this.stats.loading = true;
    
    // Cargar estadísticas principales
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = { ...data, loading: false };
        this.actualizarGraficas();
        
        // Cargar tablas separadas
        this.cargarTablaActivos();
        this.cargarTablaInactivos();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Dashboard actualizado',
          detail: 'Los datos se cargaron correctamente',
          life: 2000
        });
      },
      error: (error) => {
        console.error('Error cargando dashboard:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del dashboard',
          life: 5000
        });
        this.stats.loading = false;
      }
    });
  }

  cargarTablaActivos(): void {
    this.dashboardService.getTablaActivos().subscribe({
      next: (data) => {
        this.tablaActivos = data;
      },
      error: (error) => {
        console.error('Error cargando tabla de activos:', error);
      }
    });
  }

  cargarTablaInactivos(): void {
    this.dashboardService.getTablaInactivos().subscribe({
      next: (data) => {
        this.tablaInactivos = data;
      },
      error: (error) => {
        console.error('Error cargando tabla de inactivos:', error);
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
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += this.formatCurrency(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#495057',
            callback: (value: any) => this.formatCurrency(value)
          },
          grid: { color: '#e5e7eb' }
        },
        x: {
          ticks: { color: '#495057' },
          grid: { display: false }
        }
      },
      maintainAspectRatio: false,
      responsive: true
    };
  }

  actualizarGraficas(): void {
    // Gráfica de distribución de estatus
    this.chartDistribucion = {
      labels: ['Activos', 'Inactivos'],
      datasets: [
        {
          data: [this.stats.becadosActivos, this.stats.becadosInactivos],
          backgroundColor: ['#1f3d66', '#dc2626'],
          hoverBackgroundColor: ['#2a4a7a', '#ef4444'],
          borderWidth: 0
        }
      ]
    };

    // Gráfica de montos por mes
    this.chartMontos = this.stats.montosPorMes;
  }

  // ============== FUNCIONES DE CÁLCULO ==============

  calcularPorcentajeErogado(): number {
    if (this.stats.bolsaTotal === 0) return 0;
    return (this.stats.dineroErogado / this.stats.bolsaTotal) * 100;
  }

  calcularPorcentajeActivos(): number {
    if (this.stats.totalBecados === 0) return 0;
    return (this.stats.becadosActivos / this.stats.totalBecados) * 100;
  }

  // ============== FUNCIONES DE FILTRO ==============

  get inactivosFiltrados(): TablaInactivos[] {
    if (this.filtroTipoInactivo === 'todos') {
      return this.tablaInactivos;
    }
    return this.tablaInactivos.filter(t => t.tipo === this.filtroTipoInactivo);
  }

  get becadosInactivosFiltrados(): BecadoResumen[] {
    let todosBecados: BecadoResumen[] = [];
    this.inactivosFiltrados.forEach(grupo => {
      todosBecados = [...todosBecados, ...grupo.becados];
    });
    
    if (!this.filtroBusqueda) return todosBecados;
    
    const busqueda = this.filtroBusqueda.toLowerCase();
    return todosBecados.filter(b => 
      b.nombre_completo.toLowerCase().includes(busqueda) ||
      b.universidad.toLowerCase().includes(busqueda) ||
      b.carrera.toLowerCase().includes(busqueda)
    );
  }

  get becadosActivosFiltrados(): BecadoResumen[] {
    if (!this.filtroBusqueda) return this.tablaActivos.becados;
    
    const busqueda = this.filtroBusqueda.toLowerCase();
    return this.tablaActivos.becados.filter(b => 
      b.nombre_completo.toLowerCase().includes(busqueda) ||
      b.universidad.toLowerCase().includes(busqueda) ||
      b.carrera.toLowerCase().includes(busqueda)
    );
  }

  // ============== FUNCIONES DE EXPORTACIÓN ==============

  exportarUniversidadesMorelia(): void {
    this.dashboardService.getUniversidadesMoreliaExport().subscribe({
      next: (universidades) => {
        if (universidades.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin datos',
            detail: 'No hay universidades en Morelia para exportar',
            life: 3000
          });
          return;
        }
        
        const csv = this.convertirACSV(universidades);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        FileSaver.saveAs(blob, `universidades_morelia_${new Date().toISOString().split('T')[0]}.csv`);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Exportado',
          detail: 'Universidades de Morelia exportadas correctamente',
          life: 3000
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron exportar los datos',
          life: 5000
        });
      }
    });
  }

  exportarReporteGeneral(): void {
    const reporte = this.generarReporteGeneral();
    const blob = new Blob([JSON.stringify(reporte, null, 2)], { type: 'application/json' });
    FileSaver.saveAs(blob, `reporte_general_${new Date().toISOString().split('T')[0]}.json`);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Reporte generado',
      detail: 'Reporte general exportado correctamente',
      life: 3000
    });
  }

  private convertirACSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  }

  private generarReporteGeneral(): any {
    return {
      fecha: new Date().toISOString(),
      usuario: this.usuario,
      resumen: {
        totalBecados: this.stats.totalBecados,
        totalUniversidades: this.stats.totalUniversidades,
        totalModalidades: this.stats.totalModalidades,
        activos: this.stats.becadosActivos,
        inactivos: this.stats.becadosInactivos
      },
      finanzas: {
        bolsaTotal: this.stats.bolsaTotal,
        dineroErogado: this.stats.dineroErogado,
        dineroFaltante: this.stats.dineroFaltante,
        faltanteActivos: this.stats.dineroFaltanteActivos,
        faltanteInactivos: this.stats.dineroFaltanteInactivos
      },
      universidadesMorelia: this.stats.universidadesMorelia,
      ultimosBecados: this.stats.ultimosBecados
    };
  }

  // ============== FUNCIONES DE UTILIDAD ==============

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  getSeverity(estatus: boolean): 'success' | 'danger' | 'info' {
    return estatus ? 'success' : 'danger';
  }

  getEstatusTexto(estatus: boolean): string {
    return estatus ? 'Activo' : 'Inactivo';
  }

  getSeveridadPorTipo(tipo: string): 'success' | 'danger' | 'warning' | 'info' {
    switch(tipo) {
      case 'Renuncia parcial':
        return 'warning';
      case 'Renuncia tácita':
        return 'info';
      case 'Baja por terminación':
        return 'danger';
      case 'Baja por reporte de universidad':
        return 'danger';
      default:
        return 'info';
    }
  }

  refrescarDashboard(): void {
    this.cargarTodosLosDatos();
  }

  // ============== FUNCIÓN AGREGADA ==============
  verDetalle(becado: BecadoResumen): void {
    this.router.navigate(['/becados', becado.id_becado]);
  }

  // Función para exportar un reporte general en PDF
  exportarReportePDF(): void {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text('Reporte General del Sistema', 14, 22);
  doc.setFontSize(11);
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
  
  // Resumen
  doc.setFontSize(14);
  doc.text('Resumen General', 14, 45);
  
  autoTable(doc, {
    startY: 50,
    head: [['Concepto', 'Valor']],
    body: [
      ['Total Becados', this.stats.totalBecados.toString()],
      ['Activos', this.stats.becadosActivos.toString()],
      ['Inactivos', this.stats.becadosInactivos.toString()],
      ['Universidades', this.stats.totalUniversidades.toString()],
      ['Modalidades', this.stats.totalModalidades.toString()],
      ['Bolsa Total', this.formatCurrency(this.stats.bolsaTotal)],
      ['Erogado', this.formatCurrency(this.stats.dineroErogado)],
      ['Faltante', this.formatCurrency(this.stats.dineroFaltante)],
      ['Perdido (Inactivos)', this.formatCurrency(this.stats.dineroFaltanteInactivos)]
    ],
    styles: { fontSize: 10 }
  });
  
  // Últimos becados
  doc.addPage();
  doc.setFontSize(14);
  doc.text('Últimos Becados Registrados', 14, 22);
  
  const ultimosData = this.stats.ultimosBecados.slice(0, 10).map(b => [
    b.nombre_completo,
    b.carrera,
    b.universidad,
    this.formatCurrency(b.monto_autorizado),
    b.estatusTexto
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['Nombre', 'Carrera', 'Universidad', 'Monto', 'Estatus']],
    body: ultimosData,
    styles: { fontSize: 8 }
  });
  
  // Guardar PDF
  doc.save(`reporte_${new Date().toISOString().split('T')[0]}.pdf`);
  
  this.messageService.add({
    severity: 'success',
    summary: 'Reporte generado',
    detail: 'PDF descargado correctamente'
  });
}
}