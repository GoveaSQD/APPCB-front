import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

// Services
import { ModalidadService } from '../../core/services/modalidad.service';
import { Modalidad } from '../../core/models/modalidad.model';

@Component({
  selector: 'app-modalidades',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './modalidades.component.html',
  styleUrls: ['./modalidades.component.css']
})
export class ModalidadesComponent implements OnInit {
  modalidades: Modalidad[] = [];
  modalidadDialog: boolean = false;
  modalidadForm: FormGroup;
  submitted: boolean = false;
  loading: boolean = false;
  editingModalidad: Modalidad | null = null;
  searchText: string = '';

  constructor(
    private modalidadService: ModalidadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.modalidadForm = this.fb.group({
      tipo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.loadModalidades();
  }

  loadModalidades(): void {
    this.loading = true;
    
    // Verificar token antes de la petición
    const token = localStorage.getItem('auth_token');
    console.log('Token antes de petición:', token ? 'Presente' : 'No presente');
    
    this.modalidadService.getAll().subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response);
        if (response.success) {
          this.modalidades = response.data || [];
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Error al cargar modalidades',
            life: 5000
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error completo:', error);
        
        // Ver qué dice el error
        if (error.status === 401) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sesión expirada',
            detail: 'Por favor, inicia sesión nuevamente',
            life: 5000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'No se pudieron cargar las modalidades',
            life: 5000
          });
        }
        this.loading = false;
      }
    });
  }

  openNew(): void {
    this.editingModalidad = null;
    this.modalidadForm.reset();
    this.submitted = false;
    this.modalidadDialog = true;
  }

  editModalidad(modalidad: Modalidad): void {
    this.editingModalidad = modalidad;
    this.modalidadForm.patchValue({
      tipo: modalidad.tipo
    });
    this.modalidadDialog = true;
  }

  deleteModalidad(modalidad: Modalidad): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar la modalidad <strong>${modalidad.tipo}</strong>?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.modalidadService.delete(modalidad.id_modalidad!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: 'Modalidad eliminada correctamente',
                life: 3000
              });
              this.loadModalidades();
            }
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'No se pudo eliminar la modalidad',
              life: 5000
            });
          }
        });
      }
    });
  }

  hideDialog(): void {
    this.modalidadDialog = false;
    this.submitted = false;
  }

  saveModalidad(): void {
    this.submitted = true;

    if (this.modalidadForm.invalid) {
      return;
    }

    const modalidadData = { tipo: this.modalidadForm.value.tipo };

    if (this.editingModalidad) {
      // Actualizar
      this.modalidadService.update(this.editingModalidad.id_modalidad!, modalidadData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Modalidad actualizada correctamente',
              life: 3000
            });
            this.loadModalidades();
            this.modalidadDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar la modalidad',
            life: 5000
          });
        }
      });
    } else {
      // Crear nueva
      this.modalidadService.create(modalidadData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Modalidad creada correctamente',
              life: 3000
            });
            this.loadModalidades();
            this.modalidadDialog = false;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al crear la modalidad',
            life: 5000
          });
        }
      });
    }
  }

  // Filtro para búsqueda
  get filteredModalidades(): Modalidad[] {
    if (!this.searchText) return this.modalidades;
    
    const searchLower = this.searchText.toLowerCase();
    return this.modalidades.filter(m => 
      m.tipo.toLowerCase().includes(searchLower)
    );
  }
}