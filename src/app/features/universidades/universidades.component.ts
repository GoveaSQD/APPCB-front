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
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Services
import { UniversidadService } from '../../core/services/universidad.service';
import { Universidad } from '../../core/models/universidad.model';

@Component({
  selector: 'app-universidades',
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
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    TagModule,
    DropdownModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './universidades.component.html',
  styleUrls: ['./universidades.component.css']
})
export class UniversidadesComponent implements OnInit {
  universidades: Universidad[] = [];
  universidadDialog: boolean = false;
  universidadForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  editingUniversidad: Universidad | null = null;
  searchText: string = '';

  // Lista de países comunes
  paises: string[] = [
    'México', 'Estados Unidos', 'Canadá', 'España', 'Argentina', 
    'Colombia', 'Chile', 'Perú', 'Brasil', 'Alemania', 'Francia',
    'Reino Unido', 'Italia', 'Japón', 'China', 'Australia'
  ];

  // Estados comunes
  estados: string[] = [
    'Activo', 'En proceso', 'Inactivo', 'Pendiente'
  ];

  constructor(
    private universidadService: UniversidadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.universidadForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: ['', Validators.required],
      pais: ['', Validators.required],
      estado: [''],
      estatus: [true]  // Ahora es booleano para el checkbox
    });
  }

  ngOnInit(): void {
    this.loadUniversidades();
  }

  loadUniversidades(): void {
    this.loading = true;
    this.universidadService.getAll().subscribe({
      next: (response) => {
        this.universidades = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las universidades',
          life: 5000
        });
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.editingUniversidad = null;
    this.universidadForm.reset({ estatus: true });
    this.submitted = false;
    this.universidadDialog = true;
  }

  editUniversidad(universidad: Universidad): void {
    this.editingUniversidad = universidad;
    this.universidadForm.patchValue({
      nombre: universidad.nombre,
      ciudad: universidad.ciudad,
      pais: universidad.pais,
      estado: universidad.estado,
      estatus: universidad.estatus
    });
    this.universidadDialog = true;
  }

  deleteUniversidad(universidad: Universidad): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la universidad <strong>${universidad.nombre}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.universidadService.delete(universidad.id_universidad!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Universidad eliminada correctamente',
                life: 3000
              });
              this.loadUniversidades();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo eliminar la universidad',
              life: 5000
            });
          }
        });
      }
    });
  }

  hideDialog(): void {
    this.universidadDialog = false;
    this.submitted = false;
  }

  saveUniversidad(): void {
    this.submitted = true;

    if (this.universidadForm.invalid) {
      return;
    }

    const universidadData = {
      ...this.universidadForm.value,
      estatus: this.universidadForm.value.estatus ? 1 : 2
    };
    
    if (this.editingUniversidad) {
      // Actualizar
      this.universidadService.update(this.editingUniversidad.id_universidad!, universidadData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Universidad actualizada correctamente',
              life: 3000
            });
            this.loadUniversidades();
            this.universidadDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar la universidad',
            life: 5000
          });
        }
      });
    } else {
      // Crear nueva
      this.universidadService.create(universidadData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Universidad creada correctamente',
              life: 3000
            });
            this.loadUniversidades();
            this.universidadDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al crear la universidad',
            life: 5000
          });
        }
      });
    }
  }

  getSeverity(estatus: number): 'success' | 'danger' {
    return estatus === 1 ? 'success' : 'danger';
  }

  getEstatusText(estatus: number): string {
    return estatus === 1 ? 'Activo' : 'Inactivo';
  }

  getEstatusSeverity(estatus: number): 'success' | 'danger' {
    return estatus === 1 ? 'success' : 'danger';
  }

  // Filtro para búsqueda
  get filteredUniversidades(): Universidad[] {
    if (!this.searchText) return this.universidades;
    
    const searchLower = this.searchText.toLowerCase();
    return this.universidades.filter(u => 
      u.nombre.toLowerCase().includes(searchLower) ||
      u.ciudad.toLowerCase().includes(searchLower) ||
      u.pais.toLowerCase().includes(searchLower) ||
      u.estado?.toLowerCase().includes(searchLower)
    );
  }
}