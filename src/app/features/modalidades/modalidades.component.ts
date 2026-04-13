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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

// Services
import { ModalidadService } from '../../core/services/modalidad.service';
import { AnioService } from '../../core/services/anio.service';
import { Modalidad } from '../../core/models/modalidad.model';

@Component({
  selector: 'app-modalidades',
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
    IconFieldModule,
    InputIconModule
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

  anioSeleccionado: number = new Date().getFullYear();

  constructor(
    private modalidadService: ModalidadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private anioService: AnioService
  ) {
    this.modalidadForm = this.fb.group({
      tipo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]]
    });

    // Suscripción al año
    this.anioService.anio$.subscribe(anio => {
      this.anioSeleccionado = anio;
      this.loadModalidades();
    });
  }

  ngOnInit(): void {
    // No llamar aquí porque ya se llama en la suscripción
  }

  loadModalidades(): void {
    this.loading = true;
    // Temporal: llamar sin año hasta que backend esté listo
    this.modalidadService.getAll().subscribe({
      next: (response) => {
        this.modalidades = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las modalidades',
          life: 5000
        });
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

  get filteredModalidades(): Modalidad[] {
    if (!this.searchText) return this.modalidades;
    
    const searchLower = this.searchText.toLowerCase();
    return this.modalidades.filter(m => 
      m.tipo.toLowerCase().includes(searchLower)
    );
  }

  refrescar(): void {
    this.loadModalidades();
    this.messageService.add({
      severity: 'success',
      summary: 'Actualizado',
      detail: 'Datos actualizados correctamente',
      life: 2000
    });
  }
}