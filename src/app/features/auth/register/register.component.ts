import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageService } from 'primeng/api';

// Services
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
    RippleModule,
    CheckboxModule,
    RadioButtonModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  providers: [MessageService],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ap_paterno: ['', [Validators.required, Validators.minLength(2)]],
      ap_materno: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      telefono: ['', [Validators.pattern('^[0-9]{10}$')]],
      rol: ['usuario'],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    confirmPassword?.setErrors(null);
    return null;
  }

  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        control?.markAsTouched();
      });

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor completa todos los campos correctamente',
        life: 3000
      });
      return;
    }

    this.loading = true;

    const registerData = {
      nombre: this.f['nombre'].value,
      ap_paterno: this.f['ap_paterno'].value,
      ap_materno: this.f['ap_materno'].value,
      email: this.f['email'].value,
      password: this.f['password'].value,
      telefono: this.f['telefono'].value || null,
      rol: this.f['rol'].value
    };

    this.authService.register(registerData).subscribe({
      next: (response) => {
        if (response.success) {
          const nombreCompleto = `${response.usuario.nombre} ${response.usuario.ap_paterno || ''} ${response.usuario.ap_materno || ''}`.trim();
          
          this.messageService.add({
            severity: 'success',
            summary: '¡Registro exitoso!',
            detail: `Bienvenido ${nombreCompleto}`,
            life: 2000
          });
          
          localStorage.setItem('token', response.token);
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Error al registrar usuario',
            life: 4000
          });
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        const errorMsg = error.error?.message || error.message || 'Error al conectar con el servidor';
        
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg,
          life: 5000
        });
        
        this.loading = false;
      }
    });
  }

  onTermsClick(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Términos y condiciones',
      detail: 'Funcionalidad en desarrollo',
      life: 3000
    });
  }
}