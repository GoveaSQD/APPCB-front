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
import { InputSwitchModule } from 'primeng/inputswitch';
import { TagModule } from 'primeng/tag';

// Services & Models
import { UsuarioService } from '../../core/services/usuario.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/usuario.model';

interface RolOption {
  label: string;
  value: number;
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
    InputSwitchModule,
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
      tipo_usuario: [2, Validators.required],
      activo: [true]
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
        tipo_usuario: usuario.tipo_usuario || 2,
        activo: usuario.activo !== false
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
        tipo_usuario: 2,
        activo: true
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

    if (this.isEditing && this.selectedUsuario) {
      if (!formData.password) {
        delete formData.password;
      }
      
      this.usuarioService.update(this.selectedUsuario.id_usuario!, formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario actualizado correctamente'
            });
            this.dialogVisible = false;
            this.loadUsuarios();
          }
          this.saving = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al actualizar usuario'
          });
          this.saving = false;
        }
      });
    } else {
      this.authService.registerUser(formData).subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario creado correctamente'
            });
            this.dialogVisible = false;
            this.loadUsuarios();
          }
          this.saving = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Error al crear usuario'
          });
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al usuario ${usuario.nombre}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usuarioService.delete(usuario.id_usuario!).subscribe({
          next: (response) => {
            if (response.success) {
              this.messageService.add({
                severity: 'success',
                summary: 'Eliminado',
                detail: 'Usuario eliminado correctamente'
              });
              this.loadUsuarios();
            }
          },
          error: (error) => {
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
      1: 'danger',
      2: 'info',
      3: 'warning'
    };
    return severities[tipo_usuario] || 'secondary';
  }
}