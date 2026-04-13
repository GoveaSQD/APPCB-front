import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Services
import { BecadoService } from '../../core/services/becado.service';
import { UniversidadService } from '../../core/services/universidad.service';
import { ModalidadService } from '../../core/services/modalidad.service';
import { Becado } from '../../core/models/becado.model';
import { Universidad } from '../../core/models/universidad.model';
import { Modalidad } from '../../core/models/modalidad.model';
import { Pago } from '../../core/models/becado.model';

export interface BecadoResumen {
  id_becado: number;
  nombre_completo: string;
  carrera: string;
  universidad: string;
  modalidad: string;
  monto_autorizado: number;
  erogado: number;
  pendiente: number;
  estatus: boolean;
  estatusTexto: string;
  tipo_inactivo?: string;
}

export interface TablaInactivos {
  tipo: string;
  cantidad: number;
  montoPerdido: number;
  becados: BecadoResumen[];
}

@Component({
  selector: 'app-becados',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    CardModule,
    DividerModule,
    FieldsetModule,
    TabViewModule,
    AccordionModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './becados.component.html',
  styleUrls: ['./becados.component.css']
})
export class BecadosComponent implements OnInit {
  // ============== DATOS PRINCIPALES ==============
  becados: Becado[] = [];
  universidades: Universidad[] = [];
  modalidades: Modalidad[] = [];
  pagos: Pago[] = [];
  
  // ============== DATOS PROCESADOS ==============
  activos: BecadoResumen[] = [];
  inactivosPorTipo: TablaInactivos[] = [];
  
  // ============== ESTADOS DEL DIÁLOGO ==============
  becadoDialog: boolean = false;
  becadoForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  editingBecado: Becado | null = null;
  
  // ============== FILTROS ==============
  searchText: string = '';
  filtroTipoInactivo: string = 'todos';

  // ============== OPCIONES ==============
  estatusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  tiposInactivo = [
    { label: 'Todos', value: 'todos' },
    { label: 'Renuncia parcial', value: 'Renuncia parcial' },
    { label: 'Renuncia tácita', value: 'Renuncia tácita' },
    { label: 'Baja por terminación', value: 'Baja por terminación' },
    { label: 'Baja por reporte de universidad', value: 'Baja por reporte de universidad' }
  ];

  constructor(
    private becadoService: BecadoService,
    private universidadService: UniversidadService,
    private modalidadService: ModalidadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.becadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido_p: ['', [Validators.required, Validators.minLength(2)]],
      apellido_m: [''],
      estatus: [true, Validators.required],
      tipo_inactivo: [''],
      carrera: ['', Validators.required],
      id_universidad: ['', Validators.required],
      id_modalidad: ['', Validators.required],
      monto_autorizado: ['', [Validators.required, Validators.min(0)]],
      erogado: ['', [Validators.required, Validators.min(0)]],
      pendiente_erogar: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.inactivosPorTipo = [];
    this.cargarTodo();
  }

  // ============== CARGA DE DATOS ==============
  cargarTodo(): void {
    this.loading = true;
    this.loadUniversidades();
    this.loadModalidades();
    this.loadBecados();
  }

  loadBecados(): void {
    this.becadoService.getAll().subscribe({
      next: (response) => {
        this.becados = response.data || [];
        this.procesarDatos();
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los becados',
          life: 5000
        });
        this.loading = false;
      }
    });
  }

  loadUniversidades(): void {
    this.universidadService.getAll().subscribe({
      next: (response) => {
        this.universidades = response.data || [];
      },
      error: (error) => {
        console.error('Error cargando universidades:', error);
      }
    });
  }

  loadModalidades(): void {
    this.modalidadService.getAll().subscribe({
      next: (response) => {
        this.modalidades = response.data || [];
      },
      error: (error) => {
        console.error('Error cargando modalidades:', error);
      }
    });
  }

  // ============== PROCESAMIENTO DE DATOS ==============
  procesarDatos(): void {
    // Procesar activos
    this.activos = this.becados
      .filter(b => b.estatus === true)
      .map(b => this.mapearABecadoResumen(b));

    // Procesar inactivos por tipo
    this.inactivosPorTipo = this.tiposInactivo.slice(1).map(t => {
      const becadosTipo = this.becados.filter(b => 
        b.estatus === false && b.tipo_inactivo === t.value
      );
      
      const montoPerdido = becadosTipo.reduce((sum, b) => {
        return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
      }, 0);
      
      return {
        tipo: t.value,
        cantidad: becadosTipo.length,
        montoPerdido,
        becados: becadosTipo.map(b => this.mapearABecadoResumen(b))
      };
    }).filter(g => g.cantidad > 0);
  }

  mapearABecadoResumen(becado: Becado): BecadoResumen {
    return {
      id_becado: becado.id_becado!,
      nombre_completo: `${becado.apellido_p} ${becado.apellido_m || ''} ${becado.nombre}`.trim(),
      carrera: becado.carrera,
      universidad: this.getUniversidadNombre(becado.id_universidad),
      modalidad: this.getModalidadTipo(becado.id_modalidad),
      monto_autorizado: becado.monto_autorizado,
      erogado: becado.erogado,
      pendiente: (becado.monto_autorizado || 0) - (becado.erogado || 0),
      estatus: becado.estatus,
      estatusTexto: becado.estatus ? 'Activo' : 'Inactivo',
      tipo_inactivo: becado.tipo_inactivo
    };
  }

  // ============== MÉTODOS PARA PAGOS DINÁMICOS ==============
  agregarPago(): void {
    this.pagos.push({
      concepto: `Pago ${this.pagos.length + 1}`,
      monto: 0
    });
    this.calcularTotales();
  }

  eliminarPago(index: number): void {
    this.pagos.splice(index, 1);
    this.calcularTotales();
  }

  calcularSumaPagos(): number {
    return this.pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
  }

  calcularTotales(): void {
    const erogado = this.calcularSumaPagos();
    const autorizado = this.becadoForm.get('monto_autorizado')?.value || 0;
    const pendiente = autorizado - erogado;
    
    this.becadoForm.patchValue({
      erogado: erogado,
      pendiente_erogar: pendiente < 0 ? 0 : pendiente
    }, { emitEvent: false });
  }

  // ============== FILTROS ==============
  get activosFiltrados(): BecadoResumen[] {
    if (!this.searchText) return this.activos;
    
    const busqueda = this.searchText.toLowerCase();
    return this.activos.filter(a => 
      a.nombre_completo.toLowerCase().includes(busqueda) ||
      a.universidad.toLowerCase().includes(busqueda) ||
      a.carrera.toLowerCase().includes(busqueda)
    );
  }

  get inactivosFiltrados(): TablaInactivos[] {
    if (this.filtroTipoInactivo === 'todos') {
      return this.inactivosPorTipo;
    }
    return this.inactivosPorTipo.filter(t => t.tipo === this.filtroTipoInactivo);
  }

  get filteredBecados(): Becado[] {
    if (!this.searchText) return this.becados;
    
    const searchLower = this.searchText.toLowerCase();
    return this.becados.filter(b => 
      b.nombre_completo?.toLowerCase().includes(searchLower) ||
      b.carrera?.toLowerCase().includes(searchLower) ||
      b.universidad_nombre?.toLowerCase().includes(searchLower) ||
      b.modalidad_tipo?.toLowerCase().includes(searchLower)
    );
  }

  // ============== ACCIONES ==============
  openNew(): void {
    this.editingBecado = null;
    this.pagos = [];
    this.becadoForm.reset({ 
      estatus: true,
      monto_autorizado: 0,
      erogado: 0,
      pendiente_erogar: 0
    });
    this.submitted = false;
    this.becadoDialog = true;
  }

  editBecado(becado: Becado): void {
    this.editingBecado = becado;
    this.pagos = becado.pagos || [];
    
    this.becadoForm.patchValue({
      nombre: becado.nombre,
      apellido_p: becado.apellido_p,
      apellido_m: becado.apellido_m,
      estatus: becado.estatus,
      tipo_inactivo: becado.tipo_inactivo,
      carrera: becado.carrera,
      id_universidad: becado.id_universidad,
      id_modalidad: becado.id_modalidad,
      monto_autorizado: becado.monto_autorizado,
      erogado: becado.erogado,
      pendiente_erogar: becado.pendiente_erogar
    });
    this.becadoDialog = true;
  }

  deleteBecado(becado: Becado): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar al becado <strong>${becado.nombre_completo}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.becadoService.delete(becado.id_becado!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Becado eliminado correctamente',
                life: 3000
              });
              this.cargarTodo();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo eliminar el becado',
              life: 5000
            });
          }
        });
      }
    });
  }

  hideDialog(): void {
    this.becadoDialog = false;
    this.submitted = false;
  }

  saveBecado(): void {
    this.submitted = true;

    if (this.becadoForm.value.estatus === false && !this.becadoForm.value.tipo_inactivo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debes seleccionar el tipo de inactivo',
        life: 5000
      });
      return;
    }

    if (this.becadoForm.invalid) {
      return;
    }

    // Calcular erogado antes de guardar
    this.calcularTotales();

    const becadoData = {
      ...this.becadoForm.value,
      pagos: this.pagos
    };

    if (this.editingBecado) {
      this.becadoService.update(this.editingBecado.id_becado!, becadoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Becado actualizado correctamente',
              life: 3000
            });
            this.cargarTodo();
            this.becadoDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar el becado',
            life: 5000
          });
        }
      });
    } else {
      this.becadoService.create(becadoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Becado creado correctamente',
              life: 3000
            });
            this.cargarTodo();
            this.becadoDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al crear el becado',
            life: 5000
          });
        }
      });
    }
  }

  refrescar(): void {
    this.cargarTodo();
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Datos actualizados correctamente',
      life: 2000
    });
  }

  onEstatusChange(estatus: boolean): void {
    const tipoInactivoControl = this.becadoForm.get('tipo_inactivo');
    
    if (estatus === false) {
      tipoInactivoControl?.setValidators([Validators.required]);
    } else {
      tipoInactivoControl?.clearValidators();
      tipoInactivoControl?.setValue('');
    }
    tipoInactivoControl?.updateValueAndValidity();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/becados', id]);
  }

  // ============== MÉTODOS PARA EL HTML ==============

calcularBolsaTotal(): number {
  return this.becados.reduce((sum, b) => sum + (b.monto_autorizado || 0), 0);
}

calcularErogadoTotal(): number {
  return this.becados.reduce((sum, b) => sum + (b.erogado || 0), 0);
}

calcularPendienteTotal(): number {
  return this.becados.reduce((sum, b) => {
    return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
  }, 0);
}

calcularPerdidoInactivos(): number {
  const inactivos = this.becados.filter(b => b.estatus === false);
  return inactivos.reduce((sum, b) => {
    return sum + ((b.monto_autorizado || 0) - (b.erogado || 0));
  }, 0);
}

getTotalInactivos(): number {
  if (!this.inactivosPorTipo || this.inactivosPorTipo.length === 0) {
    return 0;
  }
  return this.inactivosPorTipo.reduce((sum, g) => sum + g.cantidad, 0);
}

  // ============== UTILIDADES ==============
  getEstatusSeverity(estatus: boolean): 'success' | 'danger' {
    return estatus ? 'success' : 'danger';
  }

  getSeveridadPorTipo(tipo: string): 'success' | 'danger' | 'warning' | 'info' {
    switch(tipo) {
      case 'Renuncia parcial': return 'warning';
      case 'Renuncia tácita': return 'info';
      case 'Baja por terminación': return 'danger';
      case 'Baja por reporte de universidad': return 'danger';
      default: return 'info';
    }
  }

  getUniversidadNombre(id_universidad: number): string {
    const uni = this.universidades.find(u => u.id_universidad === id_universidad);
    return uni?.nombre || 'N/A';
  }

  getModalidadTipo(id_modalidad: number): string {
    const mod = this.modalidades.find(m => m.id_modalidad === id_modalidad);
    return mod?.tipo || 'N/A';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }
}