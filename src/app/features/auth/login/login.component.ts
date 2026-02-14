import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG Components
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

// PrimeNG Services
import { MessageService } from 'primeng/api';

// Services
import { AuthService } from '../../../core/services/auth.service';

// Models
import { LoginRequest, AuthResponse } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    RippleModule,
    InputGroupModule,
    InputGroupAddonModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() { 
    return this.loginForm.controls; 
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor completa todos los campos correctamente',
        life: 3000
      });
      return;
    }

    this.loading = true;

    const loginRequest: LoginRequest = {
      email: this.f['email'].value,
      password: this.f['password'].value
    };

    this.authService.login(loginRequest).subscribe({
      next: (response: AuthResponse) => {
        if (response.success) {
          const usuario = response.usuario;
          const nombreCompleto = `${usuario.nombre} ${usuario.ap_paterno || ''} ${usuario.ap_materno || ''}`.trim();
          
          this.messageService.add({
            severity: 'success',
            summary: '¡Bienvenido!',
            detail: `Hola ${nombreCompleto}`,
            life: 3000
          });
          
          localStorage.setItem('token', response.token);
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.message || 'Credenciales incorrectas',
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

  onForgotPassword(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: 'Funcionalidad en desarrollo',
      life: 3000
    });
  }
}