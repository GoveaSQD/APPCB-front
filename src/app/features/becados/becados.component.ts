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
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Services
import { BecadoService } from '../../core/services/becado.service';
import { UniversidadService } from '../../core/services/universidad.service';
import { ModalidadService } from '../../core/services/modalidad.service';
import { AnioService } from '../../core/services/anio.service';

// Models
import { Becado, Pago } from '../../core/models/becado.model';
import { Universidad } from '../../core/models/universidad.model';
import { Modalidad } from '../../core/models/modalidad.model';
import { AuthService } from '../../core/services/auth.service';

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
  tipo_inactivo?: string | null;
  // Campos adicionales para edición
  nombre?: string;
  apellido_p?: string;
  apellido_m?: string | null;  // ← Permitir null
  id_universidad?: number;
  id_modalidad?: number;
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
    AccordionModule,
    TooltipModule
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
  isAdmin: boolean = false;
  isRegistro: boolean = false;
  isPagos: boolean = false;
  
  canEditBecado: boolean = false;      // Editar datos personales
  canManagePayments: boolean = false;   // Editar pagos
  canChangeStatus: boolean = false;     // Cambiar estatus
  canEditMontoAutorizado: boolean = false;
  canEditBecadoData: boolean = false;  // Editar datos del becado (excepto pagos)
  canEditAny: boolean = false;         // Permiso para mostrar botón de editar
  canCreateBecado: boolean = false;
  seccionPagosHabilitada: boolean = true;

  
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
  searchTextInactivos: string = '';
  filtroTipoInactivo: string = 'todos';
  anioSeleccionado: number = new Date().getFullYear(); // ← INICIALIZADO

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
    private router: Router,
    private anioService: AnioService,
    private authService: AuthService
  ) {
  this.becadoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido_p: ['', [Validators.required, Validators.minLength(2)]],
    apellido_m: [''],
    estatus: [true, Validators.required],
    tipo_inactivo: [{ value: '', disabled: true }], // Inicialmente deshabilitado
    carrera: ['', Validators.required],
    id_universidad: ['', Validators.required],
    id_modalidad: ['', Validators.required],
    monto_autorizado: [0, [Validators.required, Validators.min(0)]],
    erogado: [0, [Validators.required, Validators.min(0)]],
    pendiente_erogar: [0, [Validators.required, Validators.min(0)]]
  });

    // Suscripción al año
    this.anioService.anio$.subscribe(anio => {
      this.anioSeleccionado = anio;
      this.cargarTodo();
    });
  }

ngOnInit(): void {
  // Configurar permisos según el rol
  const rol = this.authService.getRolString();
  
  this.isAdmin = rol === 'admin';
  this.isRegistro = rol === 'registro';
  this.isPagos = rol === 'pagos';
  
  // Admin: puede hacer todo
  this.canCreateBecado = this.isAdmin || this.isRegistro;
  this.canChangeStatus = this.isAdmin || this.isRegistro;
  
  // Monto autorizado: Solo Admin y Pagos (Registro NO)
  this.canEditMontoAutorizado = this.isAdmin || this.isPagos;
  
  // Datos personales: Admin y Registro pueden (Pagos NO)
  this.canEditBecadoData = this.isAdmin || this.isRegistro;
  
  // Gestión de pagos: Solo Admin y Pagos (Registro NO)
  this.canManagePayments = this.isAdmin || this.isPagos;
  
  // Botón editar: Admin, Registro y Pagos pueden ver el lápiz
  this.canEditAny = this.isAdmin || this.isRegistro || this.isPagos;
  
  console.log('Permisos configurados:', {
    isAdmin: this.isAdmin,
    isRegistro: this.isRegistro,
    isPagos: this.isPagos,
    canEditBecadoData: this.canEditBecadoData,
    canEditMontoAutorizado: this.canEditMontoAutorizado,
    canManagePayments: this.canManagePayments,
    canEditAny: this.canEditAny
  });
  
  this.inactivosPorTipo = [];
}

  // ============== CARGA DE DATOS ==============
  cargarTodo(): void {
    this.loading = true;
    this.loadUniversidades();
    this.loadModalidades();
    this.loadBecados();
  }

loadBecados(): void {
  console.log('Cargando becados...');
  this.becadoService.getAll().subscribe({
    next: (response) => {
      console.log('Respuesta del backend:', response);
      this.becados = response.data || [];
      
      // Esperar a que universidades y modalidades estén cargadas
      if (this.universidades.length > 0 && this.modalidades.length > 0) {
        this.procesarDatos();
      }
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
      // Intentar procesar si ya hay becados
      if (this.becados.length > 0) {
        this.procesarDatos();
      }
    },
    error: (error) => {
      console.error('Error cargando universidades:', error);
      // Aún así intentar procesar con datos vacíos
      if (this.becados.length > 0) {
        this.procesarDatos();
      }
    }
  });
}

loadModalidades(): void {
  this.modalidadService.getAll().subscribe({
    next: (response) => {
      this.modalidades = response.data || [];
      // Intentar procesar si ya hay becados
      if (this.becados.length > 0) {
        this.procesarDatos();
      }
    },
    error: (error) => {
      console.error('Error cargando modalidades:', error);
      // Aún así intentar procesar con datos vacíos
      if (this.becados.length > 0) {
        this.procesarDatos();
      }
    }
  });
}

  // ============== PROCESAMIENTO DE DATOS ==============
procesarDatos(): void {
  console.log('=== PROCESANDO DATOS ===');
  
  // Asegurar que todos los becados tengan pagos como array y números correctos
  this.becados = this.becados.map(b => ({
    ...b,
    pagos: b.pagos || [],
    monto_autorizado: this.parseNumber(b.monto_autorizado),
    erogado: this.parseNumber(b.erogado),
    pendiente_erogar: this.parseNumber(b.pendiente_erogar)
  }));
  
  // Procesar activos (estatus === 1)
  this.activos = this.becados
    .filter(b => b.estatus === 1)
    .map(b => this.mapearABecadoResumen(b));
  
  // Procesar inactivos (estatus === 0)
  const inactivos = this.becados.filter(b => b.estatus === 0);
  
  this.inactivosPorTipo = [];
  
  this.tiposInactivo.slice(1).forEach(t => {
    const becadosTipo = inactivos.filter(b => b.tipo_inactivo === t.value);
    
    if (becadosTipo.length > 0) {
      // Calcular monto perdido: suma de lo que NO se ha erogado (pendiente)
      const montoPerdido = becadosTipo.reduce((sum, b) => {
        const pendiente = (b.monto_autorizado || 0) - (b.erogado || 0);
        return sum + (pendiente > 0 ? pendiente : 0);
      }, 0);
      
      this.inactivosPorTipo.push({
        tipo: t.value,
        cantidad: becadosTipo.length,
        montoPerdido: montoPerdido,
        becados: becadosTipo.map(b => this.mapearABecadoResumen(b))
      });
    }
  });
  
  console.log('Monto perdido total:', this.calcularPerdidoInactivos());
}

mapearABecadoResumen(becado: Becado): BecadoResumen {
  const esActivo = becado.estatus === 1;
  
  // Calcular erogado desde los pagos si existe
  let erogado = 0;
  if (becado.pagos && becado.pagos.length > 0) {
    erogado = becado.pagos.reduce((total, pago) => {
      const monto = this.parseNumber(pago.monto);
      return total + monto;
    }, 0);
  } else {
    erogado = this.parseNumber(becado.erogado);
  }
  
  const montoAutorizado = this.parseNumber(becado.monto_autorizado);
  const pendiente = montoAutorizado - erogado;
  
  console.log(`Mapeando becado ${becado.id_becado}:`, {
    montoAutorizado,
    erogadoCalculado: erogado,
    erogadoBackend: becado.erogado,
    pagos: becado.pagos,
    pendiente
  });
  
  return {
    id_becado: becado.id_becado!,
    nombre_completo: `${becado.apellido_p} ${becado.apellido_m || ''} ${becado.nombre}`.trim(),
    carrera: becado.carrera,
    universidad: this.getUniversidadNombre(becado.id_universidad),
    modalidad: this.getModalidadTipo(becado.id_modalidad),
    monto_autorizado: montoAutorizado,
    erogado: erogado,
    pendiente: pendiente < 0 ? 0 : pendiente,
    estatus: esActivo,
    estatusTexto: esActivo ? 'Activo' : 'Inactivo',
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

// En becados.component.ts
calcularSumaPagos(): number {
  if (!this.pagos || this.pagos.length === 0) {
    return 0;
  }
  
  const suma = this.pagos.reduce((total, pago) => {
    let monto = 0;
    if (pago.monto !== null && pago.monto !== undefined) {
      monto = this.parseNumber(pago.monto);
    }
    console.log(`Pago: ${pago.concepto}, Monto: ${monto}`);
    return total + monto;
  }, 0);
  
  console.log('Suma total de pagos:', suma);
  return suma;
}

calcularTotales(): void {
  // Calcular la suma de los pagos actuales
  const erogado = this.calcularSumaPagos();
  
  // Obtener el monto autorizado (asegurar que sea número)
  let autorizado = this.becadoForm.get('monto_autorizado')?.value;
  autorizado = this.parseNumber(autorizado);
  
  // Calcular pendiente
  let pendiente = autorizado - erogado;
  if (pendiente < 0) pendiente = 0;
  
  console.log('Calculando totales:', { 
    erogadoCalculado: erogado, 
    autorizado: autorizado, 
    pendienteCalculado: pendiente,
    pagos: this.pagos 
  });
  
  // Actualizar el formulario
  this.becadoForm.patchValue({
    erogado: erogado,
    pendiente_erogar: pendiente
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

// Y actualiza el getter de inactivosFiltrados
get inactivosFiltrados(): TablaInactivos[] {
  let grupos = this.inactivosPorTipo;
  
  // Filtrar por tipo
  if (this.filtroTipoInactivo !== 'todos') {
    grupos = grupos.filter(g => g.tipo === this.filtroTipoInactivo);
  }
  
  // Filtrar por texto de búsqueda
  if (this.searchTextInactivos) {
    const busqueda = this.searchTextInactivos.toLowerCase();
    grupos = grupos.map(grupo => ({
      ...grupo,
      becados: grupo.becados.filter(b => 
        b.nombre_completo.toLowerCase().includes(busqueda) ||
        b.carrera.toLowerCase().includes(busqueda) ||
        b.universidad.toLowerCase().includes(busqueda)
      ),
      cantidad: grupo.becados.filter(b => 
        b.nombre_completo.toLowerCase().includes(busqueda) ||
        b.carrera.toLowerCase().includes(busqueda) ||
        b.universidad.toLowerCase().includes(busqueda)
      ).length
    })).filter(g => g.cantidad > 0);
  }
  
  return grupos;
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
  // Cambiar la condición: Registro también puede crear
  if (!this.isAdmin && !this.isRegistro) {
    this.messageService.add({
      severity: 'error',
      summary: 'Acceso denegado',
      detail: 'No tienes permiso para crear becados',
      life: 3000
    });
    return;
  }

  this.editingBecado = null;
  this.pagos = [];
  this.becadoForm.reset({ 
    nombre: '',
    apellido_p: '',
    apellido_m: '',
    estatus: true,
    tipo_inactivo: '',
    carrera: '',
    id_universidad: '',
    id_modalidad: '',
    monto_autorizado: 0,
    erogado: 0,
    pendiente_erogar: 0
  });
  
  // Deshabilitar tipo_inactivo para nuevo becado (activo por defecto)
  this.becadoForm.get('tipo_inactivo')?.disable();
  
  // Configurar campos según el rol para NUEVO becado
  if (this.isRegistro) {
    // Registro: NO puede editar montos ni pagos
    this.deshabilitarCamposBecado(false);      // Habilitar campos personales
    this.deshabilitarCamposFinancieros(true);  // Deshabilitar montos
    this.habilitarSeccionPagos(false);         // Ocultar sección de pagos
    
    // Establecer monto autorizado en 0 (no puede editarlo)
    this.becadoForm.get('monto_autorizado')?.setValue(0);
    this.becadoForm.get('monto_autorizado')?.disable();
  } else if (this.isAdmin) {
    // Admin: todo habilitado
    this.deshabilitarCamposBecado(false);
    this.deshabilitarCamposFinancieros(false);
    this.habilitarSeccionPagos(true);
  }
  
  this.submitted = false;
  this.becadoDialog = true;
}

editBecado(becadoResumen: BecadoResumen): void {
  // Todos los roles que pueden editar algo pueden abrir el diálogo
  if (!this.canEditAny) {
    this.verDetalle(becadoResumen.id_becado);
    return;
  }
  
  this.loading = true;
  this.becadoService.getById(becadoResumen.id_becado).subscribe({
    next: (response) => {
      if (response.success && response.data) {
        const becado = response.data;
        this.editingBecado = becado;
        
        this.pagos = (becado.pagos || []).map(pago => ({
          id: pago.id,
          concepto: pago.concepto || '',
          monto: this.parseNumber(pago.monto)
        }));
        
        const montoAutorizado = this.parseNumber(becado.monto_autorizado);
        const erogado = this.parseNumber(becado.erogado);
        const pendienteErogar = this.parseNumber(becado.pendiente_erogar);
        const esActivo = becado.estatus === 1;
        
        // Cargar TODOS los valores al formulario (incluyendo financieros)
        this.becadoForm.patchValue({
          nombre: becado.nombre,
          apellido_p: becado.apellido_p,
          apellido_m: becado.apellido_m || '',
          estatus: esActivo,
          tipo_inactivo: becado.tipo_inactivo || '',
          carrera: becado.carrera,
          id_universidad: becado.id_universidad,
          id_modalidad: becado.id_modalidad,
          monto_autorizado: montoAutorizado,
          erogado: erogado,
          pendiente_erogar: pendienteErogar
        });
        
        this.calcularTotales();
        
        // Configurar campos según el rol
        if (this.isPagos) {
          // Pagos: SOLO puede editar pagos
          this.deshabilitarCamposBecado(true);    // Deshabilitar campos de becado
          this.habilitarSeccionPagos(true);        // Habilitar sección de pagos
        } 
        else if (this.isRegistro) {
          // Registro: Puede editar datos personales pero NO pagos ni montos
          this.deshabilitarCamposBecado(false);   // Habilitar campos de becado
          this.deshabilitarCamposFinancieros(true); // Deshabilitar montos
          this.habilitarSeccionPagos(false);       // Ocultar sección de pagos
          
          // Asegurar que los valores financieros se muestren correctamente (aunque deshabilitados)
          this.becadoForm.get('monto_autorizado')?.setValue(montoAutorizado);
          this.becadoForm.get('erogado')?.setValue(erogado);
          this.becadoForm.get('pendiente_erogar')?.setValue(pendienteErogar);
        } 
        else if (this.isAdmin) {
          // Admin: Todo habilitado
          this.deshabilitarCamposBecado(false);
          this.habilitarSeccionPagos(true);
        }
        
        // Configurar tipo_inactivo según estatus
        const tipoControl = this.becadoForm.get('tipo_inactivo');
        if (esActivo) {
          tipoControl?.disable();
          tipoControl?.clearValidators();
        } else {
          if (this.canChangeStatus) {
            tipoControl?.enable();
            tipoControl?.setValidators([Validators.required]);
          } else {
            tipoControl?.disable();
          }
        }
        tipoControl?.updateValueAndValidity();
        
        this.becadoDialog = true;
      }
      this.loading = false;
    },
    error: (error) => {
      console.error('Error cargando becado:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la información del becado',
        life: 5000
      });
      this.loading = false;
    }
  });
}

deshabilitarCamposBecado(disabled: boolean): void {
  // Campos de datos personales que se deshabilitan para Pagos
  const camposBecado = ['nombre', 'apellido_p', 'apellido_m', 'carrera', 'id_universidad', 'id_modalidad'];
  
  // Para Pagos: deshabilitar todos estos campos
  // Para Registro: habilitar estos campos (disabled = false)
  camposBecado.forEach(campo => {
    const control = this.becadoForm.get(campo);
    if (disabled) {
      control?.disable();
    } else {
      control?.enable();
    }
  });
  
  // Control específico para monto_autorizado
  const montoControl = this.becadoForm.get('monto_autorizado');
  if (this.canEditMontoAutorizado) {
    montoControl?.enable();
  } else {
    montoControl?.disable();
  }
}

habilitarSeccionPagos(enabled: boolean): void {
  this.seccionPagosHabilitada = enabled;
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

// En becados.component.ts - Modifica el método saveBecado
saveBecado(): void {
  this.submitted = true;

  const estatusValue = this.becadoForm.value.estatus;
  
  if (estatusValue === false && !this.becadoForm.value.tipo_inactivo) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Debes seleccionar el tipo de inactivo',
      life: 5000
    });
    return;
  }

  if (this.becadoForm.invalid) {
    Object.keys(this.becadoForm.controls).forEach(key => {
      this.becadoForm.get(key)?.markAsTouched();
    });
    return;
  }

  this.loading = true;
  this.calcularTotales();
  
  setTimeout(() => {
    const formValues = this.becadoForm.value;
    
    let nombre, apellido_p, apellido_m, carrera, id_universidad, id_modalidad, monto_autorizado, erogado, pendiente_erogar;
    
    if (this.isPagos && this.editingBecado) {
      // Pagos: solo puede editar pagos y monto autorizado
      nombre = this.editingBecado.nombre;
      apellido_p = this.editingBecado.apellido_p;
      apellido_m = this.editingBecado.apellido_m || null;
      carrera = this.editingBecado.carrera;
      id_universidad = this.editingBecado.id_universidad;
      id_modalidad = this.editingBecado.id_modalidad;
      monto_autorizado = Number(formValues.monto_autorizado);
      erogado = this.calcularSumaPagos();
      pendiente_erogar = monto_autorizado - erogado;
      if (pendiente_erogar < 0) pendiente_erogar = 0;
    } 
    else if (this.isRegistro && this.editingBecado) {
      // Registro: NO puede editar montos ni pagos, usar valores originales
      nombre = formValues.nombre;
      apellido_p = formValues.apellido_p;
      apellido_m = formValues.apellido_m || null;
      carrera = formValues.carrera;
      id_universidad = Number(formValues.id_universidad);
      id_modalidad = Number(formValues.id_modalidad);
      monto_autorizado = this.editingBecado.monto_autorizado;
      erogado = this.editingBecado.erogado;
      pendiente_erogar = this.editingBecado.pendiente_erogar;
    } 
    else {
      // Admin: usar valores del formulario
      nombre = formValues.nombre;
      apellido_p = formValues.apellido_p;
      apellido_m = formValues.apellido_m || null;
      carrera = formValues.carrera;
      id_universidad = Number(formValues.id_universidad);
      id_modalidad = Number(formValues.id_modalidad);
      monto_autorizado = Number(formValues.monto_autorizado);
      erogado = Number(formValues.erogado);
      pendiente_erogar = Number(formValues.pendiente_erogar);
    }
    
    const becadoData: any = {
      nombre: nombre,
      apellido_p: apellido_p,
      apellido_m: apellido_m,
      carrera: carrera,
      id_universidad: id_universidad,
      id_modalidad: id_modalidad,
      monto_autorizado: monto_autorizado,
      erogado: erogado,
      pendiente_erogar: pendiente_erogar,
      estatus: estatusValue ? 1 : 0,
      pagos: this.pagos.filter(p => p.monto > 0 && p.concepto).map(p => ({
        concepto: p.concepto,
        monto: Number(p.monto)
      }))
    };

    if (estatusValue === false) {
      becadoData.tipo_inactivo = formValues.tipo_inactivo;
    } else {
      becadoData.tipo_inactivo = null;
    }

    console.log('=== DATOS A ENVIAR ===');
    console.log('Rol:', this.isPagos ? 'Pagos' : (this.isRegistro ? 'Registro' : 'Admin'));
    console.log('Monto autorizado:', monto_autorizado);
    console.log('Erogado:', erogado);
    console.log('Pendiente:', pendiente_erogar);

    if (this.editingBecado) {
      // ACTUALIZAR becado existente
      this.becadoService.update(this.editingBecado.id_becado!, becadoData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: this.isPagos ? 'Pagos actualizados correctamente' : 'Becado actualizado correctamente',
              life: 3000
            });
            this.becadoDialog = false;
            setTimeout(() => {
              this.cargarTodo();
            }, 500);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al actualizar',
              life: 5000
            });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar',
            life: 5000
          });
        }
      });
    } else {
      // CREAR NUEVO BECADO
      let montoAutorizadoValue = 0;
      let erogadoValue = 0;
      let pendienteValue = 0;
      
      if (this.isRegistro) {
        // Registro: enviar montos en 0
        montoAutorizadoValue = 0;
        erogadoValue = 0;
        pendienteValue = 0;
      } else {
        // Admin: usar valores del formulario
        montoAutorizadoValue = Number(formValues.monto_autorizado);
        erogadoValue = Number(formValues.erogado);
        pendienteValue = Number(formValues.pendiente_erogar);
      }
      
      const newBecadoData: any = {
        nombre: formValues.nombre,
        apellido_p: formValues.apellido_p,
        apellido_m: formValues.apellido_m || null,
        carrera: formValues.carrera,
        id_universidad: Number(formValues.id_universidad),
        id_modalidad: Number(formValues.id_modalidad),
        monto_autorizado: montoAutorizadoValue,
        erogado: erogadoValue,
        pendiente_erogar: pendienteValue,
        estatus: estatusValue ? 1 : 0,
        pagos: []  // Registro no puede agregar pagos al crear
      };
      
      if (estatusValue === false) {
        newBecadoData.tipo_inactivo = formValues.tipo_inactivo;
      } else {
        newBecadoData.tipo_inactivo = null;
      }
      
      console.log('=== CREANDO NUEVO BECADO ===');
      console.log('Rol:', this.isRegistro ? 'Registro' : 'Admin');
      console.log('Datos:', JSON.stringify(newBecadoData, null, 2));
      
      this.becadoService.create(newBecadoData).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Becado creado correctamente',
              life: 3000
            });
            this.becadoDialog = false;
            setTimeout(() => {
              this.cargarTodo();
            }, 500);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al crear el becado',
              life: 5000
            });
          }
        },
        error: (error) => {
          this.loading = false;
          console.error('Error create:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || error.message || 'Error al crear el becado',
            life: 5000
          });
        }
      });
    }
  }, 100);
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
    tipoInactivoControl?.enable();
  } else {
    tipoInactivoControl?.clearValidators();
    tipoInactivoControl?.setValue(null); // Usar null en lugar de string vacío
    tipoInactivoControl?.disable();
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
    const inactivos = this.becados.filter(b => b.estatus === 0);
    return inactivos.reduce((sum, b) => {
      // Solo el pendiente (no erogado) es lo que se pierde
      const pendiente = (Number(b.monto_autorizado) || 0) - (Number(b.erogado) || 0);
      return sum + (pendiente > 0 ? pendiente : 0);
    }, 0);
  }

  getTotalInactivos(): number {
    if (!this.inactivosPorTipo || this.inactivosPorTipo.length === 0) {
      return 0;
    }
    return this.inactivosPorTipo.reduce((sum, g) => sum + g.cantidad, 0);
  }

  // ============== UTILIDADES ==============
  getEstatusSeverity(estatus: number): 'success' | 'danger' {
    return estatus === 1 ? 'success' : 'danger';
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

  // Método auxiliar para parsear números correctamente
private parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') {
    return isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string') {
    // Limpiar el string: remover caracteres no numéricos excepto punto decimal
    let cleanValue = value.replace(/[^0-9.-]/g, '');
    
    // Si hay múltiples puntos decimales, tomar solo el primero
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      cleanValue = parts[0] + '.' + parts.slice(1).join('');
    }
    
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// En becados.component.ts, agrega este método
limpiarFiltros(table: any): void {
  if (table) {
    table.clear();
    table.filterGlobal('', 'contains');
    
    // Limpiar todos los filtros de columna
    if (table.filters) {
      Object.keys(table.filters).forEach(key => {
        table.filters[key] = null;
      });
    }
    
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se han eliminado todos los filtros de búsqueda',
      life: 2000
    });
  }
}

deshabilitarCamposFinancieros(disabled: boolean): void {
  // Deshabilitar campos financieros para Registro
  const camposFinancieros = ['monto_autorizado', 'erogado', 'pendiente_erogar'];
  camposFinancieros.forEach(campo => {
    const control = this.becadoForm.get(campo);
    if (disabled) {
      control?.disable();
    } else {
      control?.enable();
    }
  });
}

reactivarBecado(becado: BecadoResumen): void {
  this.confirmationService.confirm({
    message: `¿Estás seguro de reactivar al becado <strong>${becado.nombre_completo}</strong>?`,
    header: 'Confirmar reactivación',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sí, reactivar',
    rejectLabel: 'Cancelar',
    acceptButtonStyleClass: 'p-button-success',
    accept: () => {
      // Primero obtener todos los datos del becado
      this.becadoService.getById(becado.id_becado).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const becadoCompleto = response.data;
            
            // Crear objeto con todos los datos necesarios
            const reactivarData = {
              nombre: becadoCompleto.nombre,
              apellido_p: becadoCompleto.apellido_p,
              apellido_m: becadoCompleto.apellido_m || '',
              carrera: becadoCompleto.carrera,
              id_universidad: becadoCompleto.id_universidad,
              id_modalidad: becadoCompleto.id_modalidad,
              monto_autorizado: becadoCompleto.monto_autorizado,
              erogado: becadoCompleto.erogado,
              pendiente_erogar: becadoCompleto.pendiente_erogar,
              estatus: 1,  // Cambiar a activo
              tipo_inactivo: null,  // Limpiar tipo_inactivo
              pagos: becadoCompleto.pagos || []
            };
            
            console.log('Reactivando con datos:', reactivarData);
            
            this.becadoService.update(becado.id_becado, reactivarData).subscribe({
              next: (updateResponse) => {
                if (updateResponse.success) {
                  this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Becado reactivado correctamente',
                    life: 3000
                  });
                  this.cargarTodo();
                } else {
                  this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: updateResponse.message || 'No se pudo reactivar el becado',
                    life: 5000
                  });
                }
              },
              error: (error) => {
                console.error('Error al reactivar:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: error.error?.message || 'Error al reactivar el becado',
                  life: 5000
                });
              }
            });
          }
        },
        error: (error) => {
          console.error('Error al obtener becado:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo obtener la información del becado',
            life: 5000
          });
        }
      });
    }
  });
}
}