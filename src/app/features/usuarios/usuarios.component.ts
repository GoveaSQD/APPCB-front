import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { TagModule } from 'primeng/tag';

// Services & Models
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

interface RolOption {
  label: string;
  value: number; // 1, 2, 3
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    PasswordModule,
    TagModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading = false;
  saving = false;
  dialogVisible = false;
  isEditing = false;
  selectedUsuario: Usuario | null = null;

  usuarioForm: FormGroup;
  rolesOptions: RolOption[] = [
    { label: 'Administrador', value: 1 },
    { label: 'Registro', value: 2 },
    { label: 'Pagos', value: 3 }
  ];

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      ap_paterno: [''],
      ap_materno: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tipo_usuario: [2, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.usuarios = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
        this.loading = false;
      }
    });
  }

  openDialog(edit: boolean, usuario?: Usuario): void {
    this.isEditing = edit;
    this.dialogVisible = true;
    
    if (edit && usuario) {
      this.selectedUsuario = usuario;
      
      this.usuarioForm.patchValue({
        nombre: usuario.nombre,
        ap_paterno: usuario.ap_paterno || '',
        ap_materno: usuario.ap_materno || '',
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario || 2
      });
      
      this.usuarioForm.get('password')?.clearValidators();
      this.usuarioForm.get('password')?.updateValueAndValidity();
    } else {
      this.selectedUsuario = null;
      this.usuarioForm.reset({
        nombre: '',
        ap_paterno: '',
        ap_materno: '',
        email: '',
        password: '',
        tipo_usuario: 2
      });
      this.usuarioForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.usuarioForm.get('password')?.updateValueAndValidity();
    }
  }

  saveUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.usuarioForm.value;

    const dataToSend: any = {
      nombre: formData.nombre.trim(),
      ap_paterno: formData.ap_paterno ? formData.ap_paterno.trim() : null,
      ap_materno: formData.ap_materno ? formData.ap_materno.trim() : null,
      email: formData.email.trim().toLowerCase(),
      tipo_usuario: Number(formData.tipo_usuario) // FORZAR como número: 1, 2 o 3
    };

    if (formData.password && formData.password.trim() !== '') {
      dataToSend.password = formData.password;
    }

    console.log('Enviando al backend:', JSON.stringify(dataToSend, null, 2));

    if (this.isEditing && this.selectedUsuario) {
      // ACTUALIZAR usuario existente
      this.usuarioService.update(this.selectedUsuario.id_usuario!, dataToSend).subscribe({
        next: (response) => {
          console.log('Respuesta update:', response);
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario actualizado correctamente'
            });
            this.dialogVisible = false;
            this.loadUsuarios();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al actualizar usuario'
            });
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error HTTP al actualizar:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || error.message || 'Error al actualizar usuario'
          });
          this.saving = false;
        }
      });
    } else {
      // CREAR nuevo usuario
      if (!dataToSend.password) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La contraseña es requerida para nuevos usuarios'
        });
        this.saving = false;
        return;
      }
      
      this.authService.registerUser(dataToSend).subscribe({
        next: (response) => {
          console.log('Respuesta create:', response);
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario creado correctamente'
            });
            this.dialogVisible = false;
            this.loadUsuarios(); // Recargar lista
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Error al crear usuario'
            });
          }
          this.saving = false;
        },
        error: (error) => {
          console.error('Error HTTP al crear:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || error.message || 'Error al crear usuario'
          });
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al usuario "${usuario.nombre} ${usuario.ap_paterno || ''}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.usuarioService.delete(usuario.id_usuario!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'Usuario eliminado correctamente'
              });
              this.loadUsuarios(); // Recargar lista
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.message || 'Error al eliminar usuario'
              });
            }
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.message || 'Error al eliminar usuario'
            });
          }
        });
      }
    });
  }

  getRolLabel(tipo_usuario: number): string {
    const roles: Record<number, string> = {
      1: 'Administrador',
      2: 'Registro',
      3: 'Pagos'
    };
    return roles[tipo_usuario] || 'Desconocido';
  }

  getRolSeverity(tipo_usuario: number): string {
    const severities: Record<number, string> = {
      1: 'danger',    // Admin - rojo
      2: 'info',      // Registro - azul
      3: 'warning'    // Pagos - naranja
    };
    return severities[tipo_usuario] || 'secondary';
  }
}