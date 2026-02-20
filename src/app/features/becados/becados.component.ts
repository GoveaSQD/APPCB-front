import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
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
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Services
import { BecadoService } from '../../core/services/becado.service';
import { UniversidadService } from '../../core/services/universidad.service';
import { ModalidadService } from '../../core/services/modalidad.service';
import { Becado } from '../../core/models/becado.model';
import { Universidad } from '../../core/models/universidad.model';
import { Modalidad } from '../../core/models/modalidad.model';

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
    FieldsetModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './becados.component.html',
  styleUrls: ['./becados.component.css']
})
export class BecadosComponent implements OnInit {
  becados: Becado[] = [];
  universidades: Universidad[] = [];
  modalidades: Modalidad[] = [];
  becadoDialog: boolean = false;
  becadoForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  editingBecado: Becado | null = null;
  searchText: string = '';

  // Opciones para estatus
  estatusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  constructor(
    private becadoService: BecadoService,
    private universidadService: UniversidadService,
    private modalidadService: ModalidadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.becadoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido_p: ['', [Validators.required, Validators.minLength(2)]],
      apellido_m: [''],
      estatus: [true, Validators.required],
      carrera: ['', Validators.required],
      id_universidad: ['', Validators.required],
      id_modalidad: ['', Validators.required],
      monto_autorizado: ['', [Validators.required, Validators.min(0)]],
      monto_1: ['', Validators.min(0)],
      monto_2: ['', Validators.min(0)],
      monto_3: ['', Validators.min(0)],
      monto_4: ['', Validators.min(0)],
      monto_5: ['', Validators.min(0)],
      monto_6: ['', Validators.min(0)],
      erogado: ['', [Validators.required, Validators.min(0)]],
      pendiente_erogar: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadBecados();
    this.loadUniversidades();
    this.loadModalidades();
  }

  loadBecados(): void {
    this.loading = true;
    this.becadoService.getAll().subscribe({
      next: (response) => {
        this.becados = response.data || [];
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

  openNew(): void {
    this.editingBecado = null;
    this.becadoForm.reset({ estatus: true });
    this.submitted = false;
    this.becadoDialog = true;
  }

  editBecado(becado: Becado): void {
    this.editingBecado = becado;
    this.becadoForm.patchValue({
      nombre: becado.nombre,
      apellido_p: becado.apellido_p,
      apellido_m: becado.apellido_m,
      estatus: becado.estatus,
      carrera: becado.carrera,
      id_universidad: becado.id_universidad,
      id_modalidad: becado.id_modalidad,
      monto_autorizado: becado.monto_autorizado,
      monto_1: becado.monto_1,
      monto_2: becado.monto_2,
      monto_3: becado.monto_3,
      monto_4: becado.monto_4,
      monto_5: becado.monto_5,
      monto_6: becado.monto_6,
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
              this.loadBecados();
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

    if (this.becadoForm.invalid) {
      return;
    }

    const becadoData = this.becadoForm.value;

    if (this.editingBecado) {
      // Actualizar
      this.becadoService.update(this.editingBecado.id_becado!, becadoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Becado actualizado correctamente',
              life: 3000
            });
            this.loadBecados();
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
      // Crear nuevo
      this.becadoService.create(becadoData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Becado creado correctamente',
              life: 3000
            });
            this.loadBecados();
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

  getEstatusSeverity(estatus: boolean): 'success' | 'danger' {
    return estatus ? 'success' : 'danger';
  }

  getUniversidadNombre(id_universidad: number): string {
    const uni = this.universidades.find(u => u.id_universidad === id_universidad);
    return uni?.nombre || 'N/A';
  }

  getModalidadTipo(id_modalidad: number): string {
    const mod = this.modalidades.find(m => m.id_modalidad === id_modalidad);
    return mod?.tipo || 'N/A';
  }

  // Filtro para búsqueda
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

  // Calcular total erogado (suma de montos 1-6)
  calcularTotalErogado(): number {
    const form = this.becadoForm.value;
    return (form.monto_1 || 0) + 
           (form.monto_2 || 0) + 
           (form.monto_3 || 0) + 
           (form.monto_4 || 0) + 
           (form.monto_5 || 0) + 
           (form.monto_6 || 0);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(value);
  }
}